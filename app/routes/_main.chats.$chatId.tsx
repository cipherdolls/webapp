import { Outlet } from 'react-router';
import type { Avatar, Chat, ProcessEvent } from '~/types';
import type { Route } from './+types/_main.chats.$chatId';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { useEffect, useState } from 'react';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';
import MessagesMode from '~/components/chat/MessagesMode';
import TalkMode from '~/components/chat/TalkMode';
import ChatJobErrors from '~/components/chat/ChatJobErrors';
import { useChatEvents } from '~/hooks/useChatEvents';
import { ChatJob, type ChatJobType } from '~/components/chat/types/chatState';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { chatId } = params;
  const chatRes = await fetchWithAuth(`chats/${chatId}`);
  if (!chatRes.ok) {
    throw new Error('Failed to fetch chats and messages');
  }
  const chat: Chat = await chatRes.json();

  // fetch avatar
  const avatarRes = await fetchWithAuth(`avatars/${chat.avatar.id}`);
  if (!avatarRes.ok) {
    throw new Error('Failed to fetch avatar');
  }
  const avatar: Avatar = await avatarRes.json();

  return { chat, avatar };
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
  const { chat, avatar } = loaderData;
  const [jobError, setJobError] = useState<ProcessEvent | null>(null);

  const { talkMode, initChatStore, setCurrentJob } = useChatStore(
    useShallow((state) => ({
      talkMode: state.talkMode,
      initChatStore: state.initChatStore,
      setCurrentJob: state.setCurrentJob,
    }))
  );

  useEffect(() => {
    initChatStore();
  }, [chat.id]);

  useChatEvents(chat.id, {
    onProcessEvent: async (event) => {
      if (event.jobStatus === 'failed') setJobError(event as ProcessEvent);
      const isValidJob = (state: string): state is ChatJobType => state in ChatJob;
      if (isValidJob(event.resourceName)) {
        setCurrentJob(event.jobStatus === 'active' ? event.resourceName : null);
      }
    },
  });

  return (
    <>
      {talkMode ? <TalkMode chat={chat} avatar={avatar} /> : <MessagesMode chat={chat} avatar={avatar} />}
      <Outlet />
      <ChatJobErrors chat={chat} jobError={jobError} />
    </>
  );
}
