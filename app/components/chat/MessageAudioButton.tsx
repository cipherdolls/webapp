import React from 'react';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { ChatState, type ChatStateType } from '~/components/chat/types/chatState';
import AnimationRecording from '~/components/ui/AnimationRecording';

interface MessageAudioButtonProps {
  setInputState: React.Dispatch<React.SetStateAction<ChatStateType>>;
  isGenerating: boolean;
  inputState: ChatStateType;
}

const MessageAudioButton: React.FC<MessageAudioButtonProps> = ({ inputState, setInputState, isGenerating }) => {
  const handleClick = () => {
    setInputState((prevState) => (prevState === ChatState.recording ? ChatState.input : ChatState.recording));
  };

  return (
    <Button.Root size='icon' type='button' onClick={handleClick} disabled={isGenerating} className='relative z-[1]'>
      <Button.Icon as={inputState === 'recording' ? Icons.stopSound : Icons.microphone} />
      {inputState === 'recording' && <AnimationRecording className='absolute top-1/2 left-1/2 -translate-1/2 -z-10' />}
    </Button.Root>
  );
};

export default MessageAudioButton;
