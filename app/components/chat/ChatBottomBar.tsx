import React, { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import type { Chat } from '~/types';
import AutosizeTextarea from './ui/AutosizeTextarea';
import MessageRecordingButton from './MessageRecordingButton';
import EyeStatus from './ui/EyeStatus';
import { ChatState, type ChatStateType } from './types/chatState';
import { backendUrl } from '~/constants';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';
import { useChatEvents } from '~/hooks/useChatEvents';
import { cn } from '~/utils/cn';

interface ChatBottomBarProps {
  chat: Chat;
  isGenerating: boolean;
}

const ChatBottomBar: React.FC<ChatBottomBarProps> = ({ isGenerating, chat }) => {
  const { playAudio, stopAudio } = useAudioPlayer();
  const [newMessage, setNewMessage] = useState('');
  const fetcher = useFetcher();
  const [chatState, setChatState] = useState<ChatStateType>(ChatState.input);
  

  useChatEvents({
    chat,
    onActionEvent: (event) => {
      if (event.type === 'audio' && event.action === 'play') {
        setChatState(ChatState.avatarSpeaking);
        const audio = new Audio(`${backendUrl}/messages/${event.messageId}/audio`);
        playAudio(audio, () => setChatState(ChatState.input));
      }
    },
  });

  useEffect(() => {
    stopAudio();
  }, [chat.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
      setNewMessage('');
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
            <EyeStatus
              status={chatState}
              className={cn({
                'animate-pulse-speak': chatState === ChatState.avatarSpeaking || chatState === ChatState.recording,
              })}
            />

            {chatState === ChatState.notification && (
              <div className='text-body-md text-base-black flex items-center gap-2'>
                <Icons.warning />
                Chat is not available
              </div>
            )}

            {chatState === ChatState.recording && (
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
              <Button.Root size='icon' type='submit' disabled={chatState === ChatState.notification || isGenerating}>
                <Button.Icon as={Icons.sendMessage} />
              </Button.Root>
            ) : (
              <MessageRecordingButton chatState={chatState} setChatState={setChatState} isGenerating={isGenerating} />
            )}
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
};

export default ChatBottomBar;
