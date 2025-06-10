import { Outlet, useNavigate, useRevalidator } from 'react-router';
import type { AudioEvent, Avatar, Chat, Message, ProcessEvent } from '~/types';
import type { Route } from './+types/_main.chats.$chatId';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import ChatTopBar from '~/components/chat/ChatTopBar';
import ChatBottomBar from '~/components/chat/ChatBottomBar';
import ChatBody from '~/components/chat/ChatBody';
import { useChatEvents } from '~/hooks/useChatEvents';
import { apiUrl, API_ENDPOINTS } from '~/constants';
import { useEffect } from 'react';
import type { ChatJobType } from '~/components/chat/types/chatState';
import { ChatJob, ChatState } from '~/components/chat/types/chatState';
import { useAlert } from '~/providers/AlertDialogProvider';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';
import { useAudioPlayerContext } from 'react-use-audio-player';
import { useUnmount } from 'usehooks-ts';
import { useAudioUnlock } from '~/hooks/useAudioUnlock';
import MessagesMode from '~/components/chat/MessagesMode';
import TalkMode from '~/components/chat/TalkMode';

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
  const { load, stop, play, duration } = useAudioPlayerContext();

  const { talkMode, silentMode, setCurrentJob, initChatStore, currentChatState, setCurrentChatState } = useChatStore(
    useShallow((state) => ({
      talkMode: state.talkMode,
      silentMode: state.silentMode,
      setCurrentJob: state.setCurrentJob,
      initChatStore: state.initChatStore,
      currentChatState: state.currentChatState,
      setCurrentChatState: state.setCurrentChatState,
    }))
  );

  useEffect(() => {
    initChatStore();
    stop();
  }, [chat.id]);

  useUnmount(() => {
    stop();
  });

  useChatEvents({
    chat,
    onProcessEvent: (event) => {
      // checking if a job exist in a chat jobs enum
      const isValidJob = (state: string): state is ChatJobType => state in ChatJob;
      if (isValidJob(event.resourceName)) {
        setCurrentJob(event.jobStatus === 'active' ? event.resourceName : null);
      }
    },
  });

  return (
    <>
      {talkMode ? <TalkMode chat={chat} avatar={avatar} /> : <MessagesMode chat={chat} avatar={avatar} messages={messages} />}
      <Outlet />
    </>
  );
}
