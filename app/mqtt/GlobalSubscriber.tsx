import { useUserEvents } from '~/hooks/useUserEvents';
import { useQueryClient } from '@tanstack/react-query';
import type { ProcessEvent, User } from '~/types';
import { showToast } from '~/components/ui/toast';
import { Icons } from '~/components/ui/icons';

const GlobalSubscriber = ({ userId }: { userId: string }) => {
  const queryClient = useQueryClient();

  useUserEvents(userId, {
    onProcessEvent: (processEvent) => {
      handleUserToasts(processEvent);

      const { resourceName, resourceId, jobName, jobStatus, resourceAttributes } = processEvent;
     
      if (resourceName === 'User' && resourceAttributes && jobStatus !== 'failed') {
        queryClient.setQueryData<User | undefined>(['user'], (old) =>
          old ? { ...old, ...resourceAttributes } : (resourceAttributes as User)
        );
      }
    },
  });

  return null;
};

export default GlobalSubscriber;

const STATUS: Record<ProcessEvent['jobStatus'], { icon: React.ReactNode; duration: number; desc: string }> = {
  completed: { icon: <Icons.thumb className='w-8 h-8 text-specials-success' />, duration: 5000, desc: 'Process finished successfully.' },
  failed: { icon: <Icons.warning className='w-8 h-8 text-specials-danger' />, duration: 8000, desc: 'Process failed.' },
  active: { icon: <Icons.loader className='w-8 h-8 animate-spin' />, duration: 5000, desc: 'Processing…' },
  retrying: { icon: <Icons.loader className='w-8 h-8 animate-spin' />, duration: 5000, desc: 'Retrying…' },
};

// USER TOASTS
const handleUserToasts = (processEvent: ProcessEvent) => {
  if (processEvent.resourceName === 'User') return;

  const { resourceName, resourceId, jobName, jobStatus } = processEvent;

  const cfg = STATUS[jobStatus] ?? STATUS.active;

  const { icon, duration, desc: description } = cfg;
  let actionLink = undefined;

  if (jobStatus === 'failed') {
    switch (resourceName) {
      case 'Avatar':
        actionLink = `/avatars/${resourceId}`;
        break;
      case 'Chat':
        actionLink = `/chats/${resourceId}`;
        break;

      default:
        break;
    }
  }

  const formattedResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
  const formattedJobName = jobName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  const formattedJobStatus = `${jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)} (ID: ${resourceId})`;

  showToast({
    toastId: `process-event-${resourceId}`,
    icon,
    title: `${formattedResourceName} ${formattedJobName}`,
    description: `${description ? description : formattedJobStatus}`,
    actionLink,
    actionText: actionLink ? 'View' : undefined,
    duration,
  });
};
