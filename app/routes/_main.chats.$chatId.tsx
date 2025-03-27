import { Outlet, useRevalidator } from 'react-router';
import type { Chat, Message } from '~/types';
import type { Route } from './+types/_main.chats.$chatId';
import { useState } from 'react';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import ChatTopBar from '~/components/chat/ChatTopBar';
import ChatBottomBar from '~/components/chat/ChatBottomBar';
import ChatBody from '~/components/chat/ChatBody';
import { useChatEvents } from '~/hooks/useChatEvents';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { chatId } = params;
  const [chatRes, messagesRes] = await Promise.all([fetchWithAuth(`chats/${chatId}`), fetchWithAuth(`messages?chatId=${chatId}`)]);
  if (!chatRes.ok || !messagesRes.ok) {
    throw new Error('Failed to fetch data');
  }
  const chat: Chat = await chatRes.json();
  const messages: Message[] = await messagesRes.json();
  return { chat, messages };
}

export default function ChatShow({ loaderData }: Route.ComponentProps) {
  const { chat, messages } = loaderData;
  const revalidator = useRevalidator();
  const [isGenerating, setIsGenerating] = useState(false);

  useChatEvents({
    chat,
    onProcessEvent: (event) => {
      if (event.resourceName === 'Message') {
        revalidator.revalidate();
      }
    },
  });

  return (
    <>
      <div className='fixed inset-0 lg:static bg-main-gradient lg:bg-transparent flex-1 flex flex-col shadow-top overflow-hidden md:rounded-xl'>
        {/* chat header */}
        <ChatTopBar chat={chat} />

        {/* chat messages scroll */}
        <ChatBody messages={messages} isGenerating={isGenerating} />

        {/* chat input field  */}
        <ChatBottomBar chat={chat} isGenerating={isGenerating} />
      </div>
      <Outlet />
    </>
  );
}
