import React, { useRef } from 'react';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { ChatState, type ChatStateType } from '~/components/chat/types/chatState';
import AnimationRecording from '~/components/ui/AnimationRecording';
import { cn } from '~/utils/cn';
import { useFetcher } from 'react-router';
import type { Chat } from '~/types';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';

interface MessageRecordingButtonProps {
  chat: Chat;
  chatState: ChatStateType;
  setChatState: (state: ChatStateType) => void;
  className?: string;
}

const MessageRecordingButton: React.FC<MessageRecordingButtonProps> = ({ chat, chatState, setChatState }) => {
  const recorder = useRef<MediaRecorder | null>(null);
  const fetcher = useFetcher();
  const { stopAudio } = useAudioPlayer();

  const finishRecording = ({ data }: { data: Blob }) => {
    const file = new File([data], 'audio.webm', { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', chat.id);
    fetcher.submit(formData, {
      method: 'post',
      action: '/messages/new',
      encType: 'multipart/form-data',
    });
  };

  const startRecording = async () => {
    try {
      setChatState(ChatState.userSpeaking);
      stopAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder.current = new MediaRecorder(stream);
      recorder.current.start();
      recorder.current.addEventListener('dataavailable', finishRecording);
    } catch (err) {
      setChatState(ChatState.input);
      console.error(err);
    }
  };

  const stopRecording = () => {
    setChatState(ChatState.input);
    try {
      if (recorder.current) {
        if (recorder.current.state !== 'inactive') recorder.current.stop();
        recorder.current.removeEventListener('dataavailable', finishRecording);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return chatState === ChatState.userSpeaking ? (
    <Button.Root size='icon' type='button' onClick={stopRecording} className={cn('relative z-[1]')} >
      <Button.Icon as={Icons.stopSound} />
      <AnimationRecording className='absolute top-1/2 left-1/2 -translate-1/2 -z-10' />
    </Button.Root>
  ) : (
    <Button.Root size='icon' type='button' onClick={startRecording} disabled={chatState === ChatState.error}>
      <Button.Icon as={Icons.microphone} />
    </Button.Root>
  );
};

export default MessageRecordingButton;
