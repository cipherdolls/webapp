import type { AudioEvent, Avatar, Chat } from '~/types';
import type { Route } from './+types/_main.chats.$chatId';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { useChatEvents } from '~/hooks/useChatEvents';
import { apiUrl } from '~/constants';
import type { ChatJobType, ChatStateType } from '~/components/chat/types/chatState';
import { ChatJob, ChatState } from '~/components/chat/types/chatState';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';
import { redirect, useFetcher, useNavigate } from 'react-router';
import VoiceVisualizer from '~/components/chat/VoiceVisualizer';
import { useState, useEffect, useRef } from 'react';
import AvatarVoiceVisualizer from '~/components/chat/AvatarVoiceVisualizer';
import * as Button from '~/components/ui/button/button';
import useVoiceRecorder from '~/hooks/useVoiceRecorder';
import useAudioAnalyzer from '~/hooks/useAudioAnalyzer';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export async function clientLoader({ params, request }: Route.LoaderArgs) {
  const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
  if (idx === 0) {
    throw redirect(`/chats/${params.chatId}`);
  }

  const { chatId } = params;
  const chatRes = await fetchWithAuth(`chats/${chatId}`);
  if (!chatRes.ok) {
    throw new Error('Failed to fetch chat');
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

export default function TalkModeView({ loaderData }: Route.ComponentProps) {
  const { chat, avatar } = loaderData;
  const navigate = useNavigate();
  const fetcher = useFetcher();
  // const { playAudio } = useAudioPlayer();
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
 

  const { hasMicAccess, currentChatState, setCurrentChatState, setCurrentJob } = useChatStore(
    useShallow((state) => ({
      hasMicAccess: state.hasMicAccess,
      currentChatState: state.currentChatState,
      setCurrentChatState: state.setCurrentChatState,
      setCurrentJob: state.setCurrentJob,
    }))
  );
  const recorder = useVoiceRecorder({
    onRecordingComplete: async (blob: Blob) => {
      if (blob && chat.id) {
        const file = new File([blob], 'audio.webm', { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', chat.id);
        fetcher.submit(formData, {
          method: 'post',
          action: '/messages/new',
          encType: 'multipart/form-data',
        });
      }
      setCurrentChatState(ChatState.Idle);
    },
  });

  const { playAudio, stopAudio } = useAudioAnalyzer({
    onAudioData: (data) => {
      setAudioData(data);
    },
    onFinish: () => {
      setCurrentChatState(ChatState.userSpeaking)
    },
  });
  

  useChatEvents({
    chat,
    onProcessEvent: (event) => {
      const isValidJob = (state: string): state is ChatJobType => state in ChatJob;
      if (isValidJob(event.resourceName)) {
        setCurrentJob(event.jobStatus === 'active' ? event.resourceName : null);
      }
    },
    onActionEvent: (event) => {
      if (event.type === 'audio' && event.action === 'play') handlePlayAudioMessage(event);
    },
  });

  const handlePlayAudioMessage = (event: AudioEvent) => {
    setCurrentChatState(ChatState.avatarSpeaking);
    const audioUrl = `${apiUrl}/messages/${event.messageId}/audio`;
    playAudio(audioUrl);
  };

  

  useEffect(() => {
    setCurrentChatState(ChatState.userSpeaking);
  }, []);
 
  useEffect(() => {
    if (currentChatState === ChatState.userSpeaking) {
      recorder.start();
    }
  }, [currentChatState]);

  // cleanup
  useEffect(
    () => () => {
      recorder.cancel();
      stopAudio();
      setCurrentChatState(ChatState.Idle);
    },
    []
  );

  return (
    <div className='flex-1 flex flex-col bg-black'>
      <div className='flex-1 flex items-center justify-center'>
        <div className='relative size-32'>
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[260px] z-0'>
            <VoiceVisualizer audioData={recorder.audioData} isActive={currentChatState === ChatState.userSpeaking} />
          </div>
          <AvatarVoiceVisualizer avatar={avatar} isPlaying={currentChatState === ChatState.avatarSpeaking} audioData={audioData} className='relative shrink-0 z-10' />
        </div>
      </div>
      <div className='p-5 flex items-center justify-center gap-5'>
        <Button.Root type='button' variant='danger' className='px-10' onClick={() => navigate(`/chats/${chat.id}`)}>
          Stop
        </Button.Root>
      </div>
    </div>
  );
}
