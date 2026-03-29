import React, { useRef, useState } from 'react';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import type { Chat } from '~/types';
import type { UseStreamRecorderReturn } from '~/hooks/useStreamRecorder';
import type { UseStreamPlayerReturn } from '~/hooks/useStreamPlayer';
import AutosizeTextarea from './ui/AutosizeTextarea';
import EyeStatus from './ui/EyeStatus';
import { ChatState } from './types/chatState';
import MessageRecordingButton from './MessageRecordingButton';
import { useChatStore } from '~/store/useChatStore';
import { useAuthStore } from '~/store/useAuthStore';
import { useAlert } from '~/providers/AlertDialogProvider';
import { useShallow } from 'zustand/react/shallow';
import { useAudioUnlock } from '~/hooks/useAudioUnlock';
import { useCreateMessage } from '~/hooks/queries/messageMutations';
import { useUser } from '~/hooks/queries/userQueries';
import { TOKEN_BALANCE } from '~/constants';

interface ChatBottomBarProps {
  chat: Chat;
  streamRecorder: UseStreamRecorderReturn;
  streamPlayer: UseStreamPlayerReturn;
  showConsole?: boolean;
  onToggleConsole?: () => void;
}

const ChatBottomBar: React.FC<ChatBottomBarProps> = ({ chat, streamRecorder, streamPlayer, showConsole, onToggleConsole }) => {
  const { data: user } = useUser();
  const { currentChatState, hasMicAccess, setTalkMode, setProcessingMessageId } = useChatStore(
    useShallow((state) => ({
      currentChatState: state.currentChatState,
      hasMicAccess: state.hasMicAccess,
      setTalkMode: state.setTalkMode,
      setProcessingMessageId: state.setProcessingMessageId,
    }))
  );
  const { isUsingBurnerWallet } = useAuthStore(
    useShallow((state) => ({
      isUsingBurnerWallet: state.isUsingBurnerWallet,
    }))
  );
  const { mutate: createMessage, isPending: isCreatingMessage } = useCreateMessage();
  const alert = useAlert();

  const [newMessage, setNewMessage] = useState('');
  const { unlockAudio } = useAudioUnlock();

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const hasMinimumTokens = isUsingBurnerWallet || (user?.tokenSpendable || 0) >= TOKEN_BALANCE.MINIMUM_SPENDABLE;
  const isStreamsConnected = streamRecorder.isConnected && streamPlayer.isConnected;
  const isMessageDisabled = currentChatState === ChatState.error || !hasMinimumTokens;

  const handleContainerClick = () => {
    textAreaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!hasMinimumTokens) {
      alert({
        icon: '💰',
        title: 'Insufficient Tokens',
        body: `You need at least ${TOKEN_BALANCE.MINIMUM_SPENDABLE} USDC to send messages. Please add more tokens to continue.`,
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    unlockAudio();

    // Generate temporary ID for processing indicator
    const tempId = `temp-${Date.now()}`;
    setProcessingMessageId(tempId);

    createMessage(
      { chatId: chat.id, formData },
      {
        onSuccess: (response) => {
          setNewMessage('');
          // Update to real message ID if available
          if (response?.id) {
            setProcessingMessageId(response.id);
          }
        },
        onError: () => {
          setProcessingMessageId(null);
          alert({
            icon: '❌',
            title: 'Error',
            body: 'Failed to send message. Please try again.',
          });
        },
      }
    );
  };

  const handleLiveTalk = () => {
    if (!hasMinimumTokens) {
      alert({
        icon: '💰',
        title: 'Insufficient Tokens',
        body: `You need at least ${TOKEN_BALANCE.MINIMUM_SPENDABLE} USDC to use live talk. Please add more tokens to continue.`,
      });
      return;
    }

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
      <div onClick={handleContainerClick} className='border border-b-0 border-neutral-04 mx-[-1px] rounded-t-xl px-5 py-4.5'>
        <form key={chat.id} className='flex items-end gap-5' onSubmit={handleSubmit}>
          {/* eye status — tap to toggle MQTT console */}
          <button type='button' onClick={onToggleConsole} className='cursor-pointer' aria-label='Toggle MQTT Console'>
            <EyeStatus />
          </button>
          <div className='flex flex-1 items-center min-h-10 gap-4'>
            {/* chat id input */}
            <input name='chatId' defaultValue={chat.id} hidden />

            {currentChatState === ChatState.error ? (
              <div className='text-body-md text-base-black flex items-center gap-2'>Chat is not available</div>
            ) : !hasMinimumTokens ? (
              <div className='text-body-md text-neutral-02 flex items-center gap-2'>
                Insufficient tokens. You need at least {TOKEN_BALANCE.MINIMUM_SPENDABLE} USDC to send messages.
              </div>
            ) : !isStreamsConnected ? (
              <div className='text-body-md text-neutral-02 flex items-center gap-2'>
                <span className='inline-block size-2 rounded-full bg-yellow-500 animate-pulse' />
                Connecting audio streams...
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
          <div className='shrink-0 flex items-center gap-2 p-5 -m-5' onClick={(e) => e.stopPropagation()}>
            {/* render microphone button only if the message field is empty */}
            {newMessage.length > 0 ? (
              <Button.Root size='icon' type='submit' disabled={isMessageDisabled || isCreatingMessage}>
                <Button.Icon as={isCreatingMessage ? Icons.loading : Icons.sendMessage} />
              </Button.Root>
            ) : (
              <MessageRecordingButton disabled={isMessageDisabled || !isStreamsConnected} streamRecorder={streamRecorder} />
            )}
            <Button.Root
              size='icon'
              type='button'
              disabled={isMessageDisabled || !isStreamsConnected}
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
