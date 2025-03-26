import React, { useState } from 'react';
import { useFetcher } from 'react-router';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import type { Chat } from '~/types';
import AutosizeTextarea from './ui/AutosizeTextarea';
import MessageAudioButton from './MessageAudioButton';
import EyeStatus from './ui/EyeStatus';
import { ChatState, type ChatStateType } from './types/chatState';

interface ChatBottomBarProps {
  chat: Chat;
  isGenerating: boolean;
}

const ChatBottomBar: React.FC<ChatBottomBarProps> = ({ isGenerating, chat }) => {
  const [message, setMessage] = useState('');
  const [inputState, setInputState] = useState<ChatStateType>('input');
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
          <div className='flex flex-1 items-center min-h-10 gap-4'>
            {/* chat id input */}
            <input name='chatId' defaultValue={chat.id} hidden />

            {/* eye status of the current chat event */}
            <EyeStatus status={ChatState.input} />

            {inputState === ChatState.notification && (
              <div className='text-body-md text-base-black flex items-center gap-2'>
                <Icons.warning />
                Chat is not available
              </div>
            )}

            {inputState === ChatState.recording && (
              <div className='flex items-center gap-4 text-body-md text-base-black'>
                <p>Recording</p>
              </div>
            )}

            {inputState === ChatState.input && (
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
              <Button.Root size='icon' type='submit' disabled={inputState === ChatState.notification || isGenerating}>
                <Button.Icon as={Icons.sendMessage} />
              </Button.Root>
            ) : (
              <MessageAudioButton inputState={inputState} setInputState={setInputState} isGenerating={isGenerating} />
            )}
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
};

export default ChatBottomBar;
