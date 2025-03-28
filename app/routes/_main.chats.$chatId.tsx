import { Outlet, useRevalidator } from 'react-router';
import type { Chat, Message } from '~/types';
import type { Route } from './+types/_main.chats.$chatId';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import ChatTopBar from '~/components/chat/ChatTopBar';
import ChatBottomBar from '~/components/chat/ChatBottomBar';
import ChatBody from '~/components/chat/ChatBody';
import { useChatEvents } from '~/hooks/useChatEvents';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';
import { ChatState } from '~/components/chat/types/chatState';
import type { ChatStateType } from '~/components/chat/types/chatState';
import { backendUrl, LOCAL_STORAGE_KEYS } from '~/constants';
import { useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
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

  const { playAudio, stopAudio } = useAudioPlayer();
  const [chatState, setChatState] = useState<ChatStateType>(ChatState.input);
  const [silentMode] = useLocalStorage(LOCAL_STORAGE_KEYS.silentMode, false);

  useChatEvents({
    chat,
    onProcessEvent: (event) => {
      // TODO: add animation logic for the eye 
      // switch (event.resourceName) {
      //   case ChatState.TtsJob:
      //     setChatState(ChatState.TtsJob);
      //     break;

      //   case ChatState.SttProcess:
      //     setChatState(ChatState.input);
      //     break;

      //   case ChatState.ChatCompletionJob:
      //     setChatState(ChatState.ChatCompletionJob);
      //     break;

      //   default:
      //     setChatState(ChatState.input);
      // }

      if (event.resourceName === 'Message') {
        revalidator.revalidate();
      }
    },
    onActionEvent: (event) => {
      if (event.type === 'audio' && event.action === 'play' && !silentMode && chatState !== ChatState.userSpeaking) {
        setChatState(ChatState.avatarSpeaking);
        const newAudioMessage = new Audio(`${backendUrl}/messages/${event.messageId}/audio`);
        playAudio(newAudioMessage, () => setChatState(ChatState.input));
      }
    },
  });

  useEffect(() => {
    if (silentMode && chatState === ChatState.avatarSpeaking) {
      stopAudio();
      setChatState(ChatState.input);
    }
  }, [silentMode]);

  return (
    <>
      <div className='fixed inset-0 lg:static bg-main-gradient lg:bg-transparent flex-1 flex flex-col shadow-top overflow-hidden md:rounded-xl'>
        {/* chat header */}
        <ChatTopBar chat={chat} />

        {/* chat messages scroll */}
        <ChatBody messages={messages} />

        {/* chat input field  */}
        <ChatBottomBar chat={chat} chatState={chatState} setChatState={setChatState} />
      </div>
      <Outlet />
    </>
  );
}
