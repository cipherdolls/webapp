import { Outlet, useNavigate, useRevalidator } from 'react-router';
import type { AudioEvent, Avatar, Chat, Message, ProcessEvent } from '~/types';
import type { Route } from './+types/_main.chats.$chatId';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import ChatTopBar from '~/components/chat/ChatTopBar';
import ChatBottomBar from '~/components/chat/ChatBottomBar';
import ChatBody from '~/components/chat/ChatBody';
import { useChatEvents } from '~/hooks/useChatEvents';
import { apiUrl, API_ENDPOINTS } from '~/constants';
import { use, useEffect } from 'react';
import type { ChatJobType, ChatStateType } from '~/components/chat/types/chatState';
import { ChatJob, ChatState } from '~/components/chat/types/chatState';
import { useState } from 'react';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';
import { useAlert, useConfirm } from '~/providers/AlertDialogProvider';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';

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
  const { playAudio, stopAudio } = useAudioPlayer();
  const navigate = useNavigate();
  const alert = useAlert();
  
  const { chatId, silentMode, initChatStore, setCurrentJob, currentChatState, setCurrentChatState } = useChatStore(useShallow((state) => ({
    chatId: state.chatId,
    silentMode: state.silentMode,
    initChatStore: state.initChatStore,
    setCurrentJob: state.setCurrentJob,
    currentChatState: state.currentChatState,
    setCurrentChatState: state.setCurrentChatState,
  })));

  useEffect(() => {
    console.log('chatId', chat.id);
    if (chat.id !== chatId) {
      initChatStore(chat.id);
    }
  }, [chat.id, chatId, initChatStore]); 
  
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
      playAudio(`${apiUrl}/messages/${event.messageId}/audio`, () => setCurrentChatState(ChatState.Idle));
    }
  };

  const handleJobError = async (event: ProcessEvent) => {
    const cfg: {
      icon: string;
      title: string;
      body: string | React.ReactNode;
      endpoint: string | null;
      actionButton?: { label: string; action: () => void };
    } = {
      icon: '❗️',
      title: 'Unknown job error',
      body: 'Something went wrong…',
      endpoint: null,
    };

    switch (event.resourceName) {
      case ChatJob.ChatCompletionJob:
        Object.assign(cfg, {
          icon: '🧩🚫',
          title: 'Chat Completion Job Error',
          body: 'Something went wrong during ChatCompletionJob.',
          endpoint: API_ENDPOINTS.chatCompletionJob(event.resourceId),
        });
        break;

      case ChatJob.TtsJob:
        Object.assign(cfg, {
          icon: '👄🚫',
          title: 'TTS Job Error',
          body: 'Text-to-speech task aborted. Please try again later.',
          endpoint: API_ENDPOINTS.ttsJob(event.resourceId),
        });
        break;

      case ChatJob.SttJob:
        Object.assign(cfg, {
          icon: '👂🚫',
          title: 'STT Job Error',
          body: 'Speech-to-text task aborted. Try changing the provider.',
          endpoint: API_ENDPOINTS.sttJob(event.resourceId),
          actionButton: {
            label: 'Change provider',
            action: () => navigate(`/chats/${chat.id}/edit`),
          },
        });
        break;

      case ChatJob.EmbeddingJob:
        Object.assign(cfg, {
          icon: '🔢🚫',
          title: 'Embedding Job Error',
          body: <p className='bg-neutral-05 rounded-xl p-4'>Something went wrong during Embedding Job.</p>,
          endpoint: API_ENDPOINTS.embeddingJob(event.resourceId),
        });
        break;

      case ChatJob.PaymentJob:
        Object.assign(cfg, {
          icon: '💵🚫',
          title: 'Payment Job Error',
          body: 'Failed to process the transaction, please check your balance.',
          // endpoint: API_ENDPOINTS.paymentJob(event.resourceId),
        });
        break;

      default:
        console.warn('handleJobError: unhandled resourceName:', event.resourceName);
        return;
    }

    // getting job error details
    if (cfg.endpoint) {
      try {
        const res = await fetchWithAuth(cfg.endpoint);
        if (res.ok) {
          const job = await res.json();
          cfg.body = job.error || cfg.body;
        }
      } catch (e) {
        console.error('Failed to fetch job details', e);
      }
    }

    alert({
      icon: cfg.icon,
      title: cfg.title,
      body: cfg.body,
      cancelButton: 'Close',
      actionButton: cfg.actionButton,
    });
  };

  const handleProcessEvent = async (event: ProcessEvent) => {
    if (event.jobStatus === 'failed') handleJobError(event);

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
        <ChatBottomBar chat={chat} />
      </div>
      <Outlet />
    </>
  );
}
