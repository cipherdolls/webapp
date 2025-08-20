import { Outlet } from 'react-router';
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

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export default function ChatShow({ params }: Route.ComponentProps) {
  const { data: chatData, isLoading: isLoadingChat } = useChat(params.chatId);

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

  if (!chat) return null;

  return (
    <>
      {talkMode ? <TalkMode chat={chat} avatar={chat.avatar} /> : <MessagesMode chat={chat} avatar={chat.avatar} />}
      <Outlet />
      <ChatJobErrors chat={chat} />
    </>
  );
}
