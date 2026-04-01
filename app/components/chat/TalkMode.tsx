import type { Avatar, Chat } from '~/types';
import { useChatEvents } from '~/hooks/useChatEvents';
import type { ChatJobType } from '~/components/chat/types/chatState';
import { ChatJob, ChatState } from '~/components/chat/types/chatState';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';
import VoiceVisualizer from '~/components/chat/VoiceVisualizer';
import { useState, useEffect } from 'react';
import AvatarVoiceVisualizer from '~/components/chat/AvatarVoiceVisualizer';
import * as Button from '~/components/ui/button/button';
import useVoiceRecorder from '~/hooks/useVoiceRecorder';
import { useUnmount } from 'usehooks-ts';
import { useStreamRecorder } from '~/hooks/useStreamRecorder';
import { useStreamPlayer } from '~/hooks/useStreamPlayer';
import { useWebSocketAudioPlayer } from '~/hooks/useWebSocketAudioPlayer';

interface TalkModeProps {
  chat: Chat;
  avatar: Avatar;
}

const TalkMode = ({ chat, avatar }: TalkModeProps) => {
  const [jobsDone, setJobsDone] = useState({
    stt: false,
    chat: false,
    tts: false,
  });

  const { setTalkMode, currentChatState, setCurrentChatState, setCurrentJob } = useChatStore(
    useShallow((state) => ({
      setTalkMode: state.setTalkMode,
      currentChatState: state.currentChatState,
      setCurrentChatState: state.setCurrentChatState,
      setCurrentJob: state.setCurrentJob,
    }))
  );

  const { ttsCallbacks, stopTts } = useWebSocketAudioPlayer({
    onPlaybackEnd: () => {
      setCurrentChatState(ChatState.userSpeaking);
      setJobsDone({ stt: false, chat: false, tts: false });
    },
  });

  const streamPlayer = useStreamPlayer(chat.id, ttsCallbacks);
  const streamRecorder = useStreamRecorder(chat.id);

  useEffect(() => {
    streamPlayer.connect().catch((err) => console.error('[TalkMode] Stream player connect failed', err));
    streamRecorder.connect().catch((err) => console.error('[TalkMode] Stream recorder connect failed', err));
  }, [streamPlayer.connect, streamRecorder.connect]);

  const recorder = useVoiceRecorder({
    listening: currentChatState === ChatState.userSpeaking,
    onRecordingComplete: async (blob: Blob) => {
      if (blob && chat.id) {
        try {
          const buffer = await blob.arrayBuffer();
          streamRecorder.startRecording();
          streamRecorder.sendRecordingChunk(buffer);
          streamRecorder.endRecording();
        } catch (err) {
          console.error('[TalkMode] Stream recorder error', err);
        }
      }
      setCurrentChatState(ChatState.Idle);
    },
  });


  useChatEvents(chat.id, {
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
  });

  useEffect(() => {
    setCurrentChatState(ChatState.userSpeaking);
  }, []);

  useUnmount(() => {
    recorder.stop();
    streamPlayer.disconnect();
    streamRecorder.disconnect();
    stopTts();
    setCurrentChatState(ChatState.Idle);
  });

  return (
    <div className='z-30 fixed inset-0 lg:static flex-1 flex flex-col overflow-hidden md:rounded-xl max-lg:bg-gradient-talkMode'>
      <div className='flex-1 flex flex-col'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='relative size-36'>
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[320px] z-0'>
              <VoiceVisualizer
                audioData={currentChatState === ChatState.userSpeaking ? recorder.audioData : null}
                isActive={currentChatState === ChatState.userSpeaking}
                circleHideOne={currentChatState === ChatState.avatarSpeaking || jobsDone.tts}
                circleHideTwo={currentChatState === ChatState.avatarSpeaking || jobsDone.chat}
                circleHideThree={currentChatState === ChatState.avatarSpeaking || jobsDone.stt}
                circleOneColor={'#dc2647'}
                circleTwoColor={'#2fe98a'}
                circleThreeColor={'#59a7e3'}
                isProcessing={currentChatState !== ChatState.userSpeaking}
              />
            </div>
            <AvatarVoiceVisualizer avatar={avatar} isPlaying={currentChatState === ChatState.avatarSpeaking} className='relative shrink-0 z-10' />
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
