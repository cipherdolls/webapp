import React from 'react';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { ChatState, type ChatStateType } from '~/components/chat/types/chatState';
import AnimationRecording from '~/components/ui/AnimationRecording';
import { cn } from '~/utils/cn';

interface MessageRecordingButtonProps {
  setChatState: React.Dispatch<React.SetStateAction<ChatStateType>>;
  isGenerating: boolean;
  chatState: ChatStateType;
  className?: string;
}

const MessageRecordingButton: React.FC<MessageRecordingButtonProps> = ({ chatState, setChatState, isGenerating, className }) => {
  const handleClick = () => {
    setChatState((prevState) => (prevState === ChatState.recording ? ChatState.input : ChatState.recording));
  };

  return (
    <Button.Root size='icon' type='button' onClick={handleClick} disabled={isGenerating} className={cn('relative z-[1]', className)}  >
      <Button.Icon as={chatState === ChatState.recording ? Icons.stopSound : Icons.microphone} />
      {chatState === ChatState.recording && <AnimationRecording className='absolute top-1/2 left-1/2 -translate-1/2 -z-10' />}
    </Button.Root>
  );
};

export default MessageRecordingButton;
