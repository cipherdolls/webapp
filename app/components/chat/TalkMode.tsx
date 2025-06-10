import type { AudioEvent, Avatar, Chat } from '~/types';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { useChatEvents } from '~/hooks/useChatEvents';
import { apiUrl } from '~/constants';
import type { ChatJobType, ChatStateType } from '~/components/chat/types/chatState';
import { ChatJob, ChatState } from '~/components/chat/types/chatState';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';
import { useFetcher, useNavigate } from 'react-router';
import VoiceVisualizer from '~/components/chat/VoiceVisualizer';
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import AvatarVoiceVisualizer from '~/components/chat/AvatarVoiceVisualizer';
import * as Button from '~/components/ui/button/button';
import useVoiceRecorder from '~/hooks/useVoiceRecorder';
import { useAudioPlayerContext } from 'react-use-audio-player';
import { useUnmount } from 'usehooks-ts';
import useAudioData from '~/hooks/useAudioData';
import { useAudioUnlock } from '~/hooks/useAudioUnlock';

interface TalkModeProps {
  chat: Chat;
  avatar: Avatar;
}

const TalkMode = ({ chat, avatar }: TalkModeProps) => {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [jobsDone, setJobsDone] = useState({
    stt: false,
    chat: false,
    tts: false,
  });

  const { unlockAudio } = useAudioUnlock();
  const { setTalkMode, hasMicAccess, currentChatState, setCurrentChatState, setCurrentJob } = useChatStore(
    useShallow((state) => ({
      setTalkMode: state.setTalkMode,
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

  const { load, stop, player, isPlaying } = useAudioPlayerContext();
  const avatarAudioData = useAudioData();

  useChatEvents({
    chat,
    onProcessEvent: (event) => {
      if (event.jobStatus === 'completed') {
        setJobsDone((p) => {
          if (event.resourceName === ChatJob.SttJob) return { ...p, stt: true };
          if (event.resourceName === ChatJob.ChatCompletionJob) return { ...p, chat: true };
          if (event.resourceName === ChatJob.TtsJob) return { ...p, tts: true };
          return p;
        });
      }

      const isValidJob = (state: string): state is ChatJobType => state in ChatJob;
      if (isValidJob(event.resourceName)) {
        setCurrentJob(event.jobStatus === 'active' ? event.resourceName : null);
      }
    },
    onActionEvent: (event) => {
      if (event.type === 'audio' && event.action === 'play') handlePlayAudioMessage(event);
    },
  });

  const handlePlayAudioMessage = async (event: AudioEvent) => {
    setCurrentChatState(ChatState.avatarSpeaking);
    const audioUrl = `${apiUrl}/messages/${event.messageId}/audio`;

    try {
      // Fetch audio as blob to bypass CORS
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      load(blobUrl, {
        html5: true,
        autoplay: true,
        format: 'mp3',
        onend: () => {
          URL.revokeObjectURL(blobUrl); // Clean up blob URL
          setCurrentChatState(ChatState.userSpeaking);
          setJobsDone({ stt: false, chat: false, tts: false });
        },
      });
    } catch (error) {
      console.error('Failed to load audio:', error);
      setCurrentChatState(ChatState.userSpeaking);
    }
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
  useUnmount(() => {
    recorder.cancel();
    stop();
    setCurrentChatState(ChatState.Idle);
  });

  return (
    <div className='fixed inset-0 lg:static flex-1 flex flex-col overflow-hidden md:rounded-xl max-lg:bg-gradient-talkMode '>
      <div className='flex-1 flex flex-col'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='relative size-36'>
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[320px] z-0'>
              <VoiceVisualizer
                audioData={recorder.audioData}
                isActive={currentChatState === ChatState.userSpeaking}
                circleHideOne={currentChatState === ChatState.avatarSpeaking || jobsDone.tts}
                circleHideTwo={currentChatState === ChatState.avatarSpeaking || jobsDone.chat}
                circleHideThree={currentChatState === ChatState.avatarSpeaking || jobsDone.stt}
                circleOneColor={'#dc2647'}
                circleTwoColor={'#2fe98a'}
                circleThreeColor={'#59a7e3'}
              />
            </div>
            <AvatarVoiceVisualizer audioData={avatarAudioData} avatar={avatar} isPlaying={isPlaying} className='relative shrink-0 z-10' />
          </div>
        </div>
        <div className='p-5 flex items-center justify-center gap-5'>
          <Button.Root type='button' variant='danger' className='px-10' onClick={() => setTalkMode(false)}>
            Stop
          </Button.Root>
        </div>
      </div>
    </div>
  );
};

export default TalkMode;
