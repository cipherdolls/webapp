import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { cn } from '~/utils/cn';
import type { ProcessEvent } from '~/types';

interface EventItem {
  key: string;
  resourceName: string;
  jobName: string;
  jobStatus: ProcessEvent['jobStatus'];
  timestamp: number;
}

interface EventRotateProps {
  events: EventItem[];
  duration?: number;
  motionProps?: MotionProps;
  className?: string;
  onEventChange?: (currentEvent: EventItem | null) => void;
}

export function EventRotate({
  events,
  duration = 3000,
  motionProps = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  className,
  onEventChange,
}: EventRotateProps) {
  const [index, setIndex] = useState(0);

  const validEvents = events.filter((event) => event !== null).sort((a, b) => b.timestamp - a.timestamp);

  const activeEvents = validEvents.filter((event) => event.jobStatus === 'active' || event.jobStatus === 'retrying');
  const eventsToRotate = activeEvents.length > 0 ? activeEvents : validEvents.slice(0, 1);
  const currentEvent = eventsToRotate.length > 0 ? eventsToRotate[index % eventsToRotate.length] : null;

  useEffect(() => {
    if (eventsToRotate.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % eventsToRotate.length);
    }, duration);

    return () => clearInterval(interval);
  }, [eventsToRotate, duration]);

  useEffect(() => {
    onEventChange?.(currentEvent);
  }, [currentEvent, onEventChange]);

  const formatTitle = (resourceName: string, jobName: string) => {
    const formattedResourceName = resourceName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
    const formattedJobName = jobName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
    return `${formattedResourceName} ${formattedJobName}`;
  };

  const getStatusText = (jobStatus: ProcessEvent['jobStatus']) => {
    switch (jobStatus) {
      case 'completed':
        return 'Process finished successfully.';
      case 'failed':
        return 'Process failed.';
      case 'active':
        return 'Processing…';
      case 'retrying':
        return 'Retrying…';
      default:
        return 'Unknown status';
    }
  };

  const getStatusIcon = (jobStatus: ProcessEvent['jobStatus']) => {
    switch (jobStatus) {
      case 'completed':
        return <div className='w-3 h-3 text-green-500 flex items-center justify-center text-xs font-bold'>✓</div>;
      case 'failed':
        return <div className='w-3 h-3 text-red-500 flex items-center justify-center text-xs font-bold'>✗</div>;
      case 'active':
      case 'retrying':
        return <div className='w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />;
      default:
        return <div className='w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin' />;
    }
  };

  if (!currentEvent) {
    return null;
  }

  return (
    <div className='overflow-hidden'>
      <AnimatePresence mode='wait'>
        <motion.div key={currentEvent.key} className={cn('flex flex-col gap-1', className)} {...motionProps}>
          <div className='flex items-center gap-2'>
            <p className='text-sm font-medium text-gray-900 truncate flex-1'>
              {formatTitle(currentEvent.resourceName, currentEvent.jobName)}
            </p>
            <div className='shrink-0 flex items-center'>{getStatusIcon(currentEvent.jobStatus)}</div>
          </div>
          <p className='text-xs text-gray-600'>{getStatusText(currentEvent.jobStatus)}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
