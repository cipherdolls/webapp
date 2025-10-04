import { Outlet, useNavigate } from 'react-router';
import type { Route } from './+types/_main.chats.$chatId';
import { useEffect } from 'react';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';
import MessagesMode from '~/components/chat/MessagesMode';
import TalkMode from '~/components/chat/TalkMode';
import ChatJobErrors from '~/components/chat/ChatJobErrors';
import { useChatEvents } from '~/hooks/useChatEvents';
import { ChatJob, type ChatJobType } from '~/components/chat/types/chatState';
import { useChat } from '~/hooks/queries/chatQueries';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export default function ChatShow({ params }: Route.ComponentProps) {
  const { data: chatData, isLoading: isLoadingChat, error } = useChat(params.chatId);
  const navigate = useNavigate();

  const chat = chatData;

  const { talkMode, initChatStore, setCurrentJob } = useChatStore(
    useShallow((state) => ({
      talkMode: state.talkMode,
      initChatStore: state.initChatStore,
      setCurrentJob: state.setCurrentJob,
    }))
  );

  useEffect(() => {
    initChatStore();
  }, [chatData]);

  useChatEvents(chatData?.id || '', {
    onProcessEvent: async (event) => {
      const isValidJob = (state: string): state is ChatJobType => state in ChatJob;
      if (isValidJob(event.resourceName)) {
        setCurrentJob(event.jobStatus === 'active' ? event.resourceName : null);
      }
    },
    enabled: !!chatData?.id,  
  });

  // Redirect to chats index if chat doesn't exist or user doesn't have access
  useEffect(() => {
    if (!isLoadingChat && (error || !chat)) {
      navigate(ROUTES.chats, { replace: true });
    }
  }, [chat, error, isLoadingChat, navigate]);

  if (isLoadingChat || !chat) {
    return (
      <div className='flex-1 size-full flex flex-col items-center justify-center text-center pb-24 border-l border-neutral-04'>
        <div className='animate-pulse space-y-6'>
          <div className='w-16 h-16 bg-neutral-04 rounded-full mx-auto' />
          <div className='space-y-3'>
            <div className='h-6 bg-neutral-04 rounded w-48 mx-auto' />
            <div className='h-4 bg-neutral-04 rounded w-32 mx-auto' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {talkMode ? <TalkMode chat={chat} avatar={chat.avatar} /> : <MessagesMode chat={chat} avatar={chat.avatar} />}
      <Outlet />
      <ChatJobErrors chat={chat} />
    </>
  );
}
