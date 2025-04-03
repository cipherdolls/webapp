import { Outlet, useRevalidator } from 'react-router';
import type { AudioEvent, Avatar, Chat, Message, ProcessEvent } from '~/types';
import type { Route } from './+types/_main.chats.$chatId';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import ChatTopBar from '~/components/chat/ChatTopBar';
import ChatBottomBar from '~/components/chat/ChatBottomBar';
import ChatBody from '~/components/chat/ChatBody';
import { useChatEvents } from '~/hooks/useChatEvents';
import { backendUrl } from '~/constants';
import { useEffect } from 'react';
import type { ChatJobType, ChatStateType } from '~/components/chat/types/chatState';
import { ChatJob, ChatState } from '~/components/chat/types/chatState';
import { useState } from 'react';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';
import { LOCAL_STORAGE_KEYS } from '~/constants';
import { useLocalStorage } from 'usehooks-ts';
import { useAlert, usePrompt } from '~/providers/AlertDialogProvider';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { chatId } = params;
  const [chatRes, messagesRes] = await Promise.all([fetchWithAuth(`chats/${chatId}`), fetchWithAuth(`messages?chatId=${chatId}`)]);
  if (!chatRes.ok || !messagesRes.ok) {
    throw new Error('Failed to fetch chats and messages');
  }
  const chat: Chat = await chatRes.json();
  const messages: Message[] = await messagesRes.json();

  // fetch avatar
  const avatarRes = await fetchWithAuth(`avatars/${chat.avatar.id}`);
  if (!avatarRes.ok) {
    throw new Error('Failed to fetch avatar');
  }
  const avatar: Avatar = await avatarRes.json();

  return { chat, messages, avatar };
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    
    const body: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (formData.getAll(key).length > 1) {
        body[key] = formData.getAll(key);
      } else {
        body[key] = value;
      }
    }

    const res = await fetchWithAuth(`chats/${params.chatId}`, {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Failed to ${request.method} chat`);
    }

  } catch (error) {
    console.error('Failed to update chat');
  }
}

export default function ChatShow({ loaderData }: Route.ComponentProps) {
  const { chat, messages, avatar } = loaderData;
  const revalidator = useRevalidator();
  const [silentMode] = useLocalStorage(LOCAL_STORAGE_KEYS.silentMode, false);
  const { playAudio, stopAudio } = useAudioPlayer();
  const alert = useAlert();

  // state
  const [currentChatState, setCurrentChatState] = useState<ChatStateType>(ChatState.Idle);
  const [currentJob, setCurrentJob] = useState<ChatJobType | null>(null);

  // reset the chat state when the chat id changes
  useEffect(() => {
    setCurrentChatState(ChatState.Idle);
    setCurrentJob(null);
  }, [chat.id]);

  useChatEvents({
    chat,
    onProcessEvent: (event) => handleProcessEvent(event),
    onActionEvent: (event) => {
      if (event.type === 'audio' && event.action === 'play') handlePlayAudioMessage(event);
    },
  });

  // if silent mode is enabled, stop audio if the avatar is speaking
  useEffect(() => {
    if (silentMode && currentChatState === ChatState.avatarSpeaking) {
      stopAudio();
      setCurrentChatState(ChatState.Idle);
    }
  }, [silentMode]);

  const handlePlayAudioMessage = (event: AudioEvent) => {
    if (!silentMode && event.type === 'audio' && event.action === 'play') {
      setCurrentChatState(ChatState.avatarSpeaking);
      const newAudioMessage = new Audio(`${backendUrl}/messages/${event.messageId}/audio`);
      playAudio(newAudioMessage, () => setCurrentChatState(ChatState.Idle));
    }
  };

  const handleProcessEvent = async (event: ProcessEvent) => {
    // failed chat completion job
    if (event.resourceName === 'ChatCompletionJob' && event.jobStatus === 'failed') {
      const res = await fetchWithAuth(`chat-completion-jobs/${event.resourceId}`);
      if (!res.ok) {
        console.error('Failed to fetch chat completion job');
        return;
      }
       
      const job = await res.json();
      // TODO: add message from the job
      alert({
        icon: '❌',
        title: 'Chat Completion',
        body: 'The chat completion is failed.',
      });
      return;
    }
     // if message is received, revalidate the page
    if (event.resourceName === 'Message') {
      revalidator.revalidate();
      return;
    }

    // checking if a job exist in a chat jobs enum
    const isValidJob = (state: string): state is ChatJobType => state in ChatJob;
    if (isValidJob(event.resourceName)) {
      setCurrentJob(event.jobStatus === 'active' ? event.resourceName : null);
    }
  };

  return (
    <>
      <div className='fixed inset-0 lg:static bg-main-gradient lg:bg-transparent flex-1 flex flex-col shadow-top overflow-hidden md:rounded-xl'>
        {/* chat header */}
        <ChatTopBar chat={chat} avatar={avatar} />

        {/* chat messages scroll */}
        <ChatBody messages={messages} />

        {/* chat input field  */}
        <ChatBottomBar chat={chat} currentChatState={currentChatState} currentJob={currentJob} setCurrentChatState={setCurrentChatState} />
      </div>
      <Outlet />
    </>
  );
}
