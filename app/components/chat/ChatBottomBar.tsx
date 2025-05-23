import React, { useState } from 'react';
import { useFetcher } from 'react-router';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import type { Chat } from '~/types';
import AutosizeTextarea from './ui/AutosizeTextarea';
import EyeStatus from './ui/EyeStatus';
import { ChatState, type ChatJobType, type ChatStateType } from './types/chatState';
import MessageRecordingButton from './MessageRecordingButton';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';
import { useChatStore } from '~/store/useChatStore';

interface ChatBottomBarProps {
  chat: Chat;
}

const ChatBottomBar: React.FC<ChatBottomBarProps> = ({ chat }) => {
  const { currentChatState } = useChatStore();

  const [newMessage, setNewMessage] = useState('');
  const fetcher = useFetcher();
  const { unlockAudio } = useAudioPlayer();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    unlockAudio();
    const formData = new FormData(e.currentTarget);
    fetcher.submit(formData, {
      method: 'post',
      action: '/messages/new',
      encType: 'multipart/form-data',
    });
    setNewMessage('');
  };

  return (
    <div className='shrink-0 bg-white'>
      <div className='border border-b-0 border-neutral-04 mx-[-1px] rounded-t-xl px-5 py-4.5'>
        <fetcher.Form key={chat.id} className='flex items-end gap-5' onSubmit={handleSubmit}>
          {/* eye status of the current chat state */}
          <EyeStatus />
          <div className='flex flex-1 items-center min-h-10 gap-4'>
            {/* chat id input */}
            <input name='chatId' defaultValue={chat.id} hidden />

            {currentChatState === ChatState.error ? (
              <div className='text-body-md text-base-black flex items-center gap-2'>Chat is not available</div>
            ) : currentChatState === ChatState.userSpeaking ? (
              <div className='flex items-center gap-4 text-body-md text-base-black'>
                <p>Recording</p>
              </div>
            ) : (
              <AutosizeTextarea
                name='content'
                id='content'
                placeholder='Message'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className='max-h-[120px] text-body-md overflow-auto scrollbar scrollbar-medium placeholder:text-neutral-02'
              />
            )}
          </div>
          <div className='shrink-0'>
            {/* render microphone button only if the message field is empty */}
            {newMessage.length > 0 ? (
              <Button.Root size='icon' type='submit' disabled={currentChatState === ChatState.error}>
                <Button.Icon as={Icons.sendMessage} />
              </Button.Root>
            ) : (
              <MessageRecordingButton chat={chat} />
            )}
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
};

export default ChatBottomBar;
