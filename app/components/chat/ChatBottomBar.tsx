import React, { useState } from 'react';
import { useFetcher } from 'react-router';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import type { Chat } from '~/types';
import AutosizeTextarea from './ui/AutosizeTextarea';
import AnimationRecording from '~/components/ui/AnimationRecording';

interface ChatBottomBarProps {
  chat: Chat;
  isGenerating: boolean;
}

type InputState = 'input' | 'notification' | 'recording';

const ChatBottomBar: React.FC<ChatBottomBarProps> = ({ isGenerating, chat }) => {
  const [message, setMessage] = useState('');
  const [inputState, setInputState] = useState<InputState>('input');
  const fetcher = useFetcher();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
      setMessage('');
    }
  };

  return (
    <div className='shrink-0 bg-white'>
      <div className='border border-b-0 border-neutral-04 mx-[-1px] rounded-t-xl px-5 py-4.5'>
        <fetcher.Form method='post' action='/messages/new' encType='multipart/form-data' className='flex items-end gap-5'>
          <div className='flex flex-1 items-center min-h-10'>
            <input name='chatId' defaultValue={chat.id} hidden />

            {inputState === 'notification' && (
              <div className='text-body-md text-base-black flex items-center gap-2'>
                <Icons.warning />
                Chat is not available
              </div>
            )}

            {inputState === 'recording' && (
              <div className='flex items-center gap-2 text-body-md text-base-black'>
                <Icons.recording className='animate-pulse [animation-duration:1.5s]' /> Recording
              </div>
            )}

            {inputState === 'input' && (
              <AutosizeTextarea
                name='content'
                id='content'
                placeholder='Message'
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className='max-h-[120px] text-body-md overflow-auto scrollbar scrollbar-medium placeholder:text-neutral-02'
              />
            )}
          </div>
          <div className='shrink-0'>
          
            {/* render microphone button only if the message field is empty */}
            {message.length > 0 ? (
              <Button.Root size='icon' type='submit' disabled={inputState === 'notification' || isGenerating}>
                <Button.Icon as={Icons.sendMessage} />
              </Button.Root>
            ) : (
              <Button.Root
                size='icon'
                type='button'
                onClick={() => setInputState(inputState === 'recording' ? 'input' : 'recording')}
                disabled={inputState === 'notification' || isGenerating}
                className='relative z-[1]'
              >
                <Button.Icon as={inputState === 'recording' ? Icons.stopSound : Icons.microphone} />
                {inputState === 'recording' && <AnimationRecording className='absolute top-1/2 left-1/2 -translate-1/2 -z-10' />}
              </Button.Root>
            )}
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
};

export default ChatBottomBar;
