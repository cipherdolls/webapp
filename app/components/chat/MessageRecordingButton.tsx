import React, { useEffect, useRef, useState } from 'react';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { ChatState } from '~/components/chat/types/chatState';
import AnimationRecording from '~/components/ui/AnimationRecording';
import RecordingIndicator from '~/components/chat/RecordingIndicator';
import { cn } from '~/utils/cn';
import { useChatStore } from '~/store/useChatStore';
import { useAlert } from '~/providers/AlertDialogProvider';
import { useShallow } from 'zustand/react/shallow';
import type { UseStreamRecorderReturn } from '~/hooks/useStreamRecorder';

interface MessageRecordingButtonProps {
  disabled?: boolean;
  streamRecorder: UseStreamRecorderReturn;
}

const MessageRecordingButton: React.FC<MessageRecordingButtonProps> = ({ disabled = false, streamRecorder }) => {
  const { currentChatState, setCurrentChatState, hasMicAccess, requestMicAccess } = useChatStore(
    useShallow((state) => ({
      currentChatState: state.currentChatState,
      setCurrentChatState: state.setCurrentChatState,
      hasMicAccess: state.hasMicAccess,
      requestMicAccess: state.requestMicAccess,
    }))
  );

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const stopTts = useChatStore((state) => state.stopTts);
  const alert = useAlert();

  const isRecording = currentChatState === ChatState.userSpeaking;

  useEffect(() => {
    requestMicAccess();
  }, []);

  useEffect(() => {
    return () => cleanUp();
  }, []);

  const startRecording = async () => {
    try {
      if (!hasMicAccess) {
        requestMicAccess();
        alert({
          icon: '🎤 ❌',
          title: 'Microphone access required',
          body: 'Please allow access to your microphone in your browser settings for voice messages',
          actionButton: undefined,
        });
        return;
      }

      setCurrentChatState(ChatState.userSpeaking);
      stopTts();

      streamRecorder.startRecording();

      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = mediaStream;
      setStream(mediaStream);

      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorder.addEventListener('dataavailable', handleData);
      mediaRecorder.start(250);
      recorderRef.current = mediaRecorder;
    } catch (err) {
      console.error('[MessageRecordingButton] Error starting recording', err);
      streamRecorder.endRecording();
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;
    setCurrentChatState(ChatState.Idle);

    recorderRef.current.addEventListener('stop', () => {
      streamRecorder.endRecording();
      cleanUp();
    });
    recorderRef.current.stop();
  };

  const handleData = async ({ data }: { data: Blob }) => {
    if (data.size > 0) {
      const buffer = await data.arrayBuffer();
      streamRecorder.sendRecordingChunk(buffer);
    }
  };

  const cleanUp = () => {
    recorderRef.current?.removeEventListener('dataavailable', handleData);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    recorderRef.current = null;
    streamRef.current = null;
    setStream(null);
  };

  if (isRecording) {
    return (
      <div className='flex items-center gap-3'>
        <RecordingIndicator stream={stream} />
        <Button.Root size='icon' onClick={stopRecording} className={cn('relative z-[1]')} type='button' disabled={disabled}>
          <Button.Icon as={Icons.stopSound} />
          <AnimationRecording className='absolute top-1/2 left-1/2 -translate-1/2 -z-10' />
        </Button.Root>
      </div>
    );
  }

  return (
    <Button.Root size='icon' onClick={startRecording} disabled={disabled || currentChatState === ChatState.error} type='button'>
      <Button.Icon as={Icons.microphone} />
    </Button.Root>
  );
};

export default MessageRecordingButton;
