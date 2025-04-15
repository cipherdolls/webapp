import React, { useEffect, useRef, useState } from 'react';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { ChatState, type ChatStateType } from '~/components/chat/types/chatState';
import AnimationRecording from '~/components/ui/AnimationRecording';
import { cn } from '~/utils/cn';
import { useFetcher } from 'react-router';
import type { Chat } from '~/types';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';
import { useVoiceRecorder } from '~/hooks/useVoiceRecorder';

interface MessageRecordingButtonProps {
  chat: Chat;
  chatState: ChatStateType;
  setCurrentChatState: (state: ChatStateType) => void;
}

const MessageRecordingButton: React.FC<MessageRecordingButtonProps> = ({ chat, chatState, setCurrentChatState }) => {
  const fetcher = useFetcher();
  const { stopAudio } = useAudioPlayer();
  const [wasRecording, setWasRecording] = useState(false);

  const handleAudioBlob = (data: Blob) => {
    // return;
    const file = new File([data], 'audio.webm', { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', chat.id);
    fetcher.submit(formData, {
      method: 'post',
      action: '/messages/new',
      encType: 'multipart/form-data',
    });
    setCurrentChatState(ChatState.Idle);
  };

  const { startRecording, stopRecording, recordingState } = useVoiceRecorder({
    onRecordingComplete: handleAudioBlob,
    autoStopOnSilence: true,
  });

  useEffect(() => {
    if (wasRecording && chatState === ChatState.userSpeaking) {
      handleStartRecording();
    }
  }, [chatState]);

  const handleStartRecording = () => {
    if (!wasRecording) {
      setCurrentChatState(ChatState.userSpeaking);
      setWasRecording(true);
    }
    stopAudio();
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    setWasRecording(false);
  };

  console.log(recordingState);
  
  return chatState === ChatState.userSpeaking ? (
    <Button.Root size='icon' type='button' onClick={handleStopRecording} className={cn('relative z-[1]')}>
      <Button.Icon as={Icons.stopSound} />
      <AnimationRecording className='absolute top-1/2 left-1/2 -translate-1/2 -z-10' />
    </Button.Root>
  ) : (
    <Button.Root size='icon' type='button' onClick={handleStartRecording} disabled={chatState === ChatState.error}>
      <Button.Icon as={Icons.microphone} />
    </Button.Root>
  );
};

export default MessageRecordingButton;
