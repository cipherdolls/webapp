import { useUserEvents } from '~/hooks/useUserEvents';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import type { Avatar, Chat, Message, ProcessEvent, User } from '~/types';
import { showToast } from '~/components/ui/toast';
import { Icons } from '~/components/ui/icons';

const GlobalSubscriber = ({ userId }: { userId: string }) => {
  const queryClient = useQueryClient();

  useUserEvents(userId, {
    onProcessEvent: (processEvent) => {
      console.log('processEvent', processEvent);
      handleUserToasts(processEvent);
      handleUserEvent(queryClient, processEvent);
      handleMessageEvent(queryClient, processEvent);
      handleChatEvent(queryClient, processEvent);
      handleAvatarEvent(queryClient, processEvent);
    },
    onActionEvent: (actionEvent) => {
      console.log('actionEvent', actionEvent);
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



const handleChatEvent = (qc: QueryClient, e: ProcessEvent) => {
  if (e.resourceName !== 'Chat' || !e.resourceAttributes) return;
  const patch = e.resourceAttributes as Partial<Chat>;
  const chatId = (patch as any).id ?? e.resourceId;
  if (!chatId) return;

  qc.setQueryData<Chat | undefined>(['chat', chatId], (old) =>
    old ? { ...old, ...patch } : (patch as Chat)
  );
  

  qc.setQueryData<Chat[] | undefined>(['chats'], (old) => {
    if (!old) return old;
    let touched = false;
    const next = old.map((c) => {
      if (c.id !== chatId) return c;
      touched = true;
      return { ...c, ...patch };
    });
    return touched ? next : old;
  });
};




const handleAvatarEvent = (qc: QueryClient, e: ProcessEvent) => {
  if (e.resourceName !== 'Avatar' || !e.resourceAttributes) return;

  const patch = e.resourceAttributes as Partial<Avatar>;
  const avatarId = (patch as any).id ?? e.resourceId;
  if (!avatarId) return;

  qc.setQueryData<Avatar | undefined>(['avatar', avatarId], (old) =>
    old ? { ...old, ...patch } : (patch as Avatar)
  );

  // 2) Update in any lists under key ['avatars', ...]
  qc.setQueriesData(
    { predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === 'avatars' },
    (old: any) => {
      if (!old) return old;

      if (old?.pages && Array.isArray(old.pages)) {
        let touched = false;
        const pages = old.pages.map((page: any) => {
          if (!Array.isArray(page?.data)) return page;
          let changed = false;
          const data = page.data.map((a: Avatar) => {
            if (a.id !== avatarId) return a;
            changed = true;
            return { ...a, ...patch };
          });
          if (!changed) return page;
          touched = true;
          return { ...page, data };
        });
        return touched ? { ...old, pages } : old;
      }

      if (Array.isArray(old?.data)) {
        let changed = false;
        const data = old.data.map((a: Avatar) => {
          if (a.id !== avatarId) return a;
          changed = true;
          return { ...a, ...patch };
        });
        return changed ? { ...old, data } : old;
      }

      if (Array.isArray(old)) {
        let touched = false;
        const next = old.map((a: Avatar) => {
          if (a.id !== avatarId) return a;
          touched = true;
          return { ...a, ...patch };
        });
        return touched ? next : old;
      }

      return old;
    }
  );
};