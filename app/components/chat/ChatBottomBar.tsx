import React, { useState } from 'react';
import { useFetcher } from 'react-router';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import type { Chat } from '~/types';
import AutosizeTextarea from './ui/AutosizeTextarea';
import EyeStatus from './ui/EyeStatus';
import { ChatState, type ChatStateType } from './types/chatState';
import { cn } from '~/utils/cn';
import MessageRecordingButton from './MessageRecordingButton';

interface ChatBottomBarProps {
  chat: Chat;
  chatState: ChatStateType;
  setChatState: (state: ChatStateType) => void;
}

const ChatBottomBar: React.FC<ChatBottomBarProps> = ({ chat, chatState, setChatState }) => {
  const [newMessage, setNewMessage] = useState('');
  const fetcher = useFetcher();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    fetcher.submit(formData, {
      method: 'post',
      action: '/messages/new',
      encType: 'multipart/form-data',
    });
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className='shrink-0 bg-white'>
      <div className='border border-b-0 border-neutral-04 mx-[-1px] rounded-t-xl px-5 py-4.5'>
        <fetcher.Form key={chat.id} className='flex items-end gap-5' onSubmit={handleSubmit}>
          {/* eye status of the current chat state */}
          <EyeStatus
            chatState={chatState}
          />
          <div className='flex flex-1 items-center min-h-10 gap-4'>
            {/* chat id input */}
            <input name='chatId' defaultValue={chat.id} hidden />

            {chatState === ChatState.error && (
              <div className='text-body-md text-base-black flex items-center gap-2'>Chat is not available</div>
            )}

            {chatState === ChatState.userSpeaking && (
              <div className='flex items-center gap-4 text-body-md text-base-black'>
                <p>Recording</p>
              </div>
            )}

            {(chatState === ChatState.input || chatState === ChatState.avatarSpeaking) && (
              <AutosizeTextarea
                name='content'
                id='content'
                placeholder='Message'
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className='max-h-[120px] text-body-md overflow-auto scrollbar scrollbar-medium placeholder:text-neutral-02'
              />
            )}
          </div>
          <div className='shrink-0'>
            {/* render microphone button only if the message field is empty */}
            {newMessage.length > 0 ? (
              <Button.Root size='icon' type='submit' disabled={chatState === ChatState.error}>
                <Button.Icon as={Icons.sendMessage} />
              </Button.Root>
            ) : (
              <MessageRecordingButton chat={chat} chatState={chatState} setChatState={setChatState} />
            )}
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
};

export default ChatBottomBar;
