import React, { useState, useCallback } from 'react';
import { Icons } from '../ui/icons';
import { cn } from '~/utils/cn';
import type { ProcessEvent } from '~/types';
import { useChatEvents } from '~/hooks/useChatEvents';
import { EventRotate } from './EventRotate';
import * as Popover from '../ui/popover';

interface ChatEventsPanelProps {
  chatId: string;
}

interface GroupedChatEvent {
  key: string;
  resourceName: string;
  resourceId: string;
  jobName: string;
  jobStatus: ProcessEvent['jobStatus'];
  timestamp: number;
}

const ChatEventsPanel: React.FC<ChatEventsPanelProps> = ({ chatId }) => {
  const [groupedEvents, setGroupedEvents] = useState<Map<string, GroupedChatEvent>>(new Map());

  const addEvent = useCallback((event: ProcessEvent) => {
    const key = `${event.resourceName}-${event.resourceId}`;

    setGroupedEvents((prev) => {
      const newEvents = new Map(prev);

      newEvents.set(key, {
        key,
        resourceName: event.resourceName,
        resourceId: event.resourceId,
        jobName: event.jobName,
        jobStatus: event.jobStatus,
        timestamp: Date.now(),
      });

      if (newEvents.size > 10) {
        const sortedEntries = Array.from(newEvents.entries())
          .sort(([, a], [, b]) => b.timestamp - a.timestamp)
          .slice(0, 10);
        return new Map(sortedEntries);
      }

      return newEvents;
    });
  }, []);

  useChatEvents(chatId, {
    onProcessEvent: (event) => {
      console.log('ChatEventsPanel received:', event);
      addEvent(event);
    },
    enabled: !!chatId,
  });

  const formatResourceName = (resourceName: string) => {
    return resourceName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const getStatusIcon = (jobStatus: ProcessEvent['jobStatus']) => {
    switch (jobStatus) {
      case 'completed':
        return <Icons.thumb className='w-4 h-4 text-green-500' />;
      case 'failed':
        return <Icons.warning className='w-4 h-4 text-red-500' />;
      case 'active':
        return <Icons.loader className='w-4 h-4 animate-spin text-blue-500' />;
      case 'retrying':
        return <Icons.loader className='w-4 h-4 animate-spin text-yellow-500' />;
      default:
        return <Icons.loader className='w-4 h-4 animate-spin text-gray-500' />;
    }
  };

  const getStatusColor = (jobStatus: ProcessEvent['jobStatus']) => {
    switch (jobStatus) {
      case 'completed':
        return 'border-l-green-500 bg-green-50';
      case 'failed':
        return 'border-l-red-500 bg-red-50';
      case 'active':
        return 'border-l-blue-500 bg-blue-50';
      case 'retrying':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusText = (jobStatus: ProcessEvent['jobStatus']) => {
    switch (jobStatus) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'active':
        return 'Processing...';
      case 'retrying':
        return 'Retrying...';
      default:
        return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    return `${Math.floor(diff / 3600000)}h`;
  };

  const allEventsArray = Array.from(groupedEvents.values())
    .filter((event) => formatResourceName(event.resourceName) !== null)
    .sort((a, b) => b.timestamp - a.timestamp);

  // Show all events, but no rotation - just the most recent one
  const eventItems = allEventsArray.map((event) => ({
    key: event.key,
    resourceName: event.resourceName,
    jobName: event.jobName,
    jobStatus: event.jobStatus,
    timestamp: event.timestamp,
  }));

  if (allEventsArray.length === 0) {
    return null;
  }

  // Check if all events are completed/failed (no active or retrying events)
  const hasActiveEvents = allEventsArray.some((event) => event.jobStatus === 'active' || event.jobStatus === 'retrying');

  if (!hasActiveEvents) {
    return null;
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className='relative'>
          <button className='relative px-3 text-left hover:bg-gray-50/30 rounded-lg transition-colors duration-200'>
            <div className='relative overflow-hidden'>
              <div className='relative'>
                <EventRotate events={eventItems} duration={2500} />
              </div>
            </div>
          </button>
        </div>
      </Popover.Trigger>

      <Popover.Content className='w-64 p-0'>
        <div className='p-4 space-y-3'>
          <h4 className='text-sm font-medium text-base-black'>Chat Events</h4>
          <div className='space-y-2'>
            {allEventsArray.map((event) => (
              <div key={event.key} className='flex items-center justify-between'>
                <div className='flex items-center gap-2 min-w-0 flex-1'>
                  <div className='shrink-0'>{getStatusIcon(event.jobStatus)}</div>
                  <span className='text-sm text-neutral-01 truncate'>
                    {formatResourceName(event.resourceName)}
                  </span>
                </div>
                <span className='text-xs text-neutral-01 ml-2'>{formatTimestamp(event.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};

export default ChatEventsPanel;
