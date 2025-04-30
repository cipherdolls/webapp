import React, { useEffect, useRef, useState } from 'react';
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
  setCurrentChatState: (state: ChatStateType) => void;
}


const MessageRecordingButton: React.FC<MessageRecordingButtonProps> = ({
  chat,
  chatState,
  setCurrentChatState,
}) => {
  const [hasMicAccess, setHasMicAccess] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null); 
  const fetcher = useFetcher();
  const { stopAudio, unlockAudio } = useAudioPlayer();


  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(t => t.stop());
        setHasMicAccess(true);
      })
      .catch(err => console.error('Microphone access denied:', err));
  }, []);


  useEffect(() => {
    return () => cleanUp();
  }, []);


  const startRecording = async () => {
    try {
      unlockAudio();
      if (!hasMicAccess) return;  

      setCurrentChatState(ChatState.userSpeaking);
      stopAudio();

      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder.current = new MediaRecorder(streamRef.current);
      recorder.current.addEventListener('dataavailable', handleData);
      recorder.current.start();
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (!recorder.current) return;
    setCurrentChatState(ChatState.Idle);

    recorder.current.addEventListener('stop', cleanUp); 
    recorder.current.stop();
  };

  const handleData = ({ data }: { data: Blob }) => {
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

  const cleanUp = () => {
    recorder.current?.removeEventListener('dataavailable', handleData);
    streamRef.current?.getTracks().forEach(t => t.stop());  
    recorder.current = null;
    streamRef.current = null;
  };

  return chatState === ChatState.userSpeaking ? (
    <Button.Root size="icon" onClick={stopRecording} className={cn('relative z-[1]')} type="button">
      <Button.Icon as={Icons.stopSound} />
      <AnimationRecording className="absolute top-1/2 left-1/2 -translate-1/2 -z-10" />
    </Button.Root>
  ) : (
    <Button.Root
      size="icon"
      onClick={startRecording}
      disabled={chatState === ChatState.error}
      type="button"
    >
      <Button.Icon as={Icons.microphone} />
    </Button.Root>
  );
};

export default MessageRecordingButton;