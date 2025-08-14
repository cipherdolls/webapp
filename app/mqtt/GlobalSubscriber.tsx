import { useUserEvents } from '~/hooks/useUserEvents';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import type { Message, ProcessEvent, User } from '~/types';
import { showToast } from '~/components/ui/toast';
import { Icons } from '~/components/ui/icons';

const GlobalSubscriber = ({ userId }: { userId: string }) => {
  const queryClient = useQueryClient();

  useUserEvents(userId, {
    onProcessEvent: (processEvent) => {
      handleUserToasts(processEvent);
      handleUserEvent(queryClient, processEvent);
      handleMessageEvent(queryClient, processEvent);
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
  if (processEvent.resourceName === 'User' || processEvent.resourceName === 'Message') return;

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

const handleUserEvent = (queryClient: QueryClient, processEvent: ProcessEvent) => {
  if (processEvent.resourceName === 'User' && processEvent.resourceAttributes && processEvent.jobStatus !== 'failed') {
    queryClient.setQueryData<User | undefined>(['user'], (old) =>
      old ? { ...old, ...processEvent.resourceAttributes } : (processEvent.resourceAttributes as User)
    );
  }
};

const handleMessageEvent = (qc: QueryClient, e: ProcessEvent) => {
  if (e.resourceName !== 'Message' || !e.resourceAttributes) return;

  const msg = e.resourceAttributes as Message;
  const { id: messageId, chatId } = msg || {};
  if (!messageId || !chatId) return;

  qc.setQueryData<Message | undefined>(['message', messageId], msg);

  qc.setQueryData(['messages', chatId], (old: any) => {
    if (!old?.pages?.length) return old;

    const first = old.pages[0];
    const firstData: Message[] = Array.isArray(first?.data) ? first.data : [];

    return {
      ...old,
      pages: [
        { ...first, data: [msg, ...firstData] },
        ...old.pages.slice(1),
      ],
    };
  });
};
