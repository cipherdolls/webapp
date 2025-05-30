import React, { useEffect, useRef, useState } from 'react';
import type { Avatar } from '~/types';
import AvatarPicture from '../AvatarPicture';
import { PICTURE_SIZE } from '~/constants';
import EyeStatus from './ui/EyeStatus';
import { Icons } from '../ui/icons';
import * as Button from '~/components/ui/button/button';
import { ChatState, type ChatStateType } from './types/chatState';
import { useFetcher } from 'react-router';
import { useChatStore } from '~/store/useChatStore';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';
import { useShallow } from 'zustand/react/shallow';
import useVoiceRecorder from '~/hooks/useVoiceRecorder';

interface LiveTalkProps {
  avatar: Avatar;
}


// TODO: 
// 1. add loader and animation on close 
// 2. improve the logic for did start ref 

const LiveTalk: React.FC<LiveTalkProps> = ({ avatar }) => {
  const fetcher = useFetcher();
  const didStartRef = useRef(false);
  const { stopAudio } = useAudioPlayer();
  const [previousChatState, setPreviousChatState] = useState<ChatStateType>(ChatState.Idle);

  const { chatId, hasMicAccess, liveTalkMode, currentChatState, setCurrentChatState, setLiveTalkMode } = useChatStore(
    useShallow((state) => ({
      chatId: state.chatId,
      hasMicAccess: state.hasMicAccess,
      liveTalkMode: state.liveTalkMode,
      currentChatState: state.currentChatState,
      setCurrentChatState: state.setCurrentChatState,
      setLiveTalkMode: state.setLiveTalkMode,
    }))
  );



  const { startRecording, stopRecording, cancelRecording } = useVoiceRecorder({
    onRecordingComplete: async (blob: Blob) => {
      if (blob && chatId) {
        const file = new File([blob], 'audio.webm', { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', chatId);
        fetcher.submit(formData, {
          method: 'post',
          action: '/messages/new',
          encType: 'multipart/form-data',
        });
      }
      setCurrentChatState(ChatState.Idle);
    },
  });

  useEffect(() => {
    if (didStartRef.current) return;
    didStartRef.current = true;
    if (hasMicAccess) {
      stopAudio();
      setCurrentChatState(ChatState.userSpeaking);
      startRecording();
    }
  }, []);

  useEffect(() => {
   
    if (liveTalkMode && currentChatState === ChatState.Idle && previousChatState === ChatState.avatarSpeaking) {
      setCurrentChatState(ChatState.userSpeaking);
      startRecording();
    }
    setPreviousChatState(currentChatState);
  }, [currentChatState]);

  const handleStop = () => {
    cancelRecording();
    setCurrentChatState(ChatState.Idle);
    setLiveTalkMode(false);
  }


  return (
    <div className='flex-1 flex flex-col bg-black'>
      <div className='flex-1 flex items-center justify-center'>
        <div className='relative'>
          <AvatarPicture avatar={avatar} sizeType={PICTURE_SIZE.semiMedium} className='size-32 shrink-0' />
          <EyeStatus className='size-12 absolute left-full bottom-full' />
        </div>
      </div>
      <div className='p-5 flex items-center justify-center gap-5'>
        {/* <Button.Root variant='white' size='icon'>
          <Button.Icon as={Icons.microphone} />
        </Button.Root> */}

        <Button.Root variant='danger' className='px-10' onClick={() => handleStop()}>
          Stop
        </Button.Root>
      </div>
    </div>
  );
};

export default LiveTalk;
