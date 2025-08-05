import React, { useEffect, useRef } from 'react';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { ChatState } from '~/components/chat/types/chatState';
import AnimationRecording from '~/components/ui/AnimationRecording';
import { cn } from '~/utils/cn';
import type { Chat } from '~/types';
import { useChatStore } from '~/store/useChatStore';
import { useAlert } from '~/providers/AlertDialogProvider';
import { useShallow } from 'zustand/react/shallow';
import { useAudioPlayerContext } from 'react-use-audio-player';

interface MessageRecordingButtonProps {
  chat: Chat;
  onSubmit: (formData: FormData) => void;
}


const MessageRecordingButton: React.FC<MessageRecordingButtonProps> = ({
  chat,
  onSubmit
}) => {
  const { currentChatState, setCurrentChatState, hasMicAccess, requestMicAccess } = useChatStore(useShallow(state => ({
    currentChatState: state.currentChatState,
    setCurrentChatState: state.setCurrentChatState,
    hasMicAccess: state.hasMicAccess,
    requestMicAccess: state.requestMicAccess,
  })));
  
  const recorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null); 
  const { stop } = useAudioPlayerContext();
  const alert = useAlert();


  useEffect(() => {
    requestMicAccess();
  }, []);

  useEffect(() => {
    return () => cleanUp();
  }, []);


  const startRecording = async () => {
    try {
      // unlockAudio();
      if (!hasMicAccess) {
        requestMicAccess();
        alert({
          icon: "🎤 ❌",
          title: 'Microphone access required',
          body: 'Please allow access to your microphone in your browser settings for voice messages',
        });
        return
      };  

      setCurrentChatState(ChatState.userSpeaking);
      stop();

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
    onSubmit(formData);
  };

  const cleanUp = () => {
    recorder.current?.removeEventListener('dataavailable', handleData);
    streamRef.current?.getTracks().forEach(t => t.stop());  
    recorder.current = null;
    streamRef.current = null;
  };

  return currentChatState === ChatState.userSpeaking ? (
    <Button.Root size="icon" onClick={stopRecording} className={cn('relative z-[1]')} type="button">
      <Button.Icon as={Icons.stopSound} />
      <AnimationRecording className="absolute top-1/2 left-1/2 -translate-1/2 -z-10" />
    </Button.Root>
  ) : (
    <Button.Root
      size="icon"
      onClick={startRecording}
      disabled={currentChatState === ChatState.error}
      type="button"
    >
      <Button.Icon as={Icons.microphone} />
    </Button.Root>
  );
};

export default MessageRecordingButton;