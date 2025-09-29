import React, { useEffect, useRef, useState } from 'react';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import type { Chat } from '~/types';
import AutosizeTextarea from './ui/AutosizeTextarea';
import EyeStatus from './ui/EyeStatus';
import { ChatState } from './types/chatState';
import MessageRecordingButton from './MessageRecordingButton';
import { useChatStore } from '~/store/useChatStore';
import { useAlert } from '~/providers/AlertDialogProvider';
import { useShallow } from 'zustand/react/shallow';
import { useAudioUnlock } from '~/hooks/useAudioUnlock';
import { useCreateMessage } from '~/hooks/queries/messageMutations';

interface ChatBottomBarProps {
  chat: Chat;
}

const ChatBottomBar: React.FC<ChatBottomBarProps> = ({ chat }) => {
  const { currentChatState, hasMicAccess, setTalkMode } = useChatStore(
    useShallow((state) => ({
      currentChatState: state.currentChatState,
      hasMicAccess: state.hasMicAccess,
      setTalkMode: state.setTalkMode,
    }))
  );
  const { mutate: createMessage, isPending: isCreatingMessage } = useCreateMessage();
  const alert = useAlert();

  const [newMessage, setNewMessage] = useState('');
  const { unlockAudio } = useAudioUnlock();

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleContainerClick = () => {
    textAreaRef.current?.focus();
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    unlockAudio();
    createMessage(
      { chatId: chat.id, formData },
      {
        onSuccess: () => {
          setNewMessage('');
        },
        onError: (error) => {
          alert({
            icon: '❌',
            title: 'Error',
            body: 'Failed to send message. Please try again.',
          });
        },
      }
    );
  };

  const handleVoiceMessageSubmit = (formData: FormData) => {
    unlockAudio();
    createMessage({ chatId: chat.id, formData });
  };

  const handleLiveTalk = () => {
    unlockAudio();
    if (!hasMicAccess) {
      alert({
        icon: '🎤 ❌',
        title: 'Microphone access required',
        body: 'Please allow access to your microphone in your browser settings for live talk mode',
      });
      return;
    }
    setTalkMode(true);
  };

  return (
    <div className='shrink-0 bg-white'>
      <div
        onClick={handleContainerClick}
        className='border border-b-0 border-neutral-04 mx-[-1px] rounded-t-xl px-5 py-4.5'
      >
        <form key={chat.id} className='flex items-end gap-5' onSubmit={handleSubmit}>
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
                textAreaRef={textAreaRef}
                className='max-h-[120px] text-body-md overflow-auto scrollbar scrollbar-medium placeholder:text-neutral-02'
              />
            )}
          </div>
          <div className='shrink-0 flex items-center gap-2'>
            {/* render microphone button only if the message field is empty */}
            {newMessage.length > 0 ? (
              <Button.Root
                size='icon'
                type='submit'
                disabled={currentChatState === ChatState.error || isCreatingMessage || isCreatingMessage}
              >
                <Button.Icon as={isCreatingMessage ? Icons.loading : Icons.sendMessage} />
              </Button.Root>
            ) : (
              <MessageRecordingButton chat={chat} onSubmit={handleVoiceMessageSubmit} />
            )}
            <Button.Root
              size='icon'
              type='button'
              disabled={currentChatState === ChatState.error}
              onClick={() => {
                handleLiveTalk();
              }}
            >
              <Button.Icon as={Icons.liveTalk} />
            </Button.Root>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBottomBar;
