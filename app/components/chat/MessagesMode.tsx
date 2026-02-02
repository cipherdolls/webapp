import type { AudioEvent, Avatar, Chat } from '~/types';
import ChatTopBar from '~/components/chat/ChatTopBar';
import ChatBottomBar from '~/components/chat/ChatBottomBar';
import ChatBody from '~/components/chat/ChatBody';
import { useChatEvents } from '~/hooks/useChatEvents';
import { apiUrl } from '~/constants';
import { useEffect, useRef } from 'react';
import { ChatState } from '~/components/chat/types/chatState';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';
import { useAudioPlayerContext } from 'react-use-audio-player';
import { useUnmount } from 'usehooks-ts';
import { useInfiniteMessages } from '~/hooks/queries/messageQueries';
import { useQueryClient } from '@tanstack/react-query';

interface MessagesModeProps {
  chat: Chat;
  avatar: Avatar;
}

const MessagesMode = ({ chat, avatar }: MessagesModeProps) => {
  const { load, stop } = useAudioPlayerContext();
  const queryClient = useQueryClient();
  const userMessageIdRef = useRef<string | null>(null);
  const { silentMode, currentChatState, setCurrentChatState, setProcessingMessageId, setShowTypingIndicator } = useChatStore(
    useShallow((state) => ({
      silentMode: state.silentMode,
      currentChatState: state.currentChatState,
      setCurrentChatState: state.setCurrentChatState,
      setProcessingMessageId: state.setProcessingMessageId,
      setShowTypingIndicator: state.setShowTypingIndicator,
    }))
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useInfiniteMessages(chat.id);

  const messages = data?.pages.flatMap((page) => page.data).reverse() ?? [];

  useUnmount(() => {
    stop();
  });

  useChatEvents(chat.id, {
    onProcessEvent: (event) => {
      if (event.resourceName === 'Message') {
        switch (event.jobName) {
          case 'created':
            if (event.jobStatus === 'completed') {
              queryClient.invalidateQueries({ queryKey: ['messages', chat.id] });
              // Handle processing state for typing indicator
              const currentProcessingId = useChatStore.getState().processingMessageId;
              if (currentProcessingId) {
                // If this is the user message (first message after temp ID), save its ID and show typing
                if (!userMessageIdRef.current || currentProcessingId.startsWith('temp-')) {
                  userMessageIdRef.current = event.resourceId;
                  // User message received - now show typing indicator for AI response
                  setShowTypingIndicator(true);
                } else if (event.resourceId !== userMessageIdRef.current) {
                  // Different message ID = AI response - clear all processing state
                  setProcessingMessageId(null);
                  setShowTypingIndicator(false);
                  userMessageIdRef.current = null;
                }
              }
            }
            break;
          case 'updated':
            const messageContent = event?.resourceAttributes?.content;
            if (!messageContent) return;
            queryClient.invalidateQueries({ queryKey: ['messages', chat.id] });
            break;
          default:
        }
      }
    },
    onActionEvent: (event) => {
      if (event && event.type === 'audio' && event.action === 'play') handlePlayAudioMessage(event as AudioEvent);
    },
  });

  useEffect(() => {
    if (silentMode && currentChatState === ChatState.avatarSpeaking) {
      stop();
      setCurrentChatState(ChatState.Idle);
    }
  }, [silentMode]);

  const handlePlayAudioMessage = (event: AudioEvent) => {
    if (!silentMode && event.type === 'audio' && event.action === 'play') {
      setCurrentChatState(ChatState.avatarSpeaking);

      load(`${apiUrl}/messages/${event.messageId}/audio`, {
        format: 'mp3',
        html5: true,
        autoplay: true,
        onend: () => {
          setCurrentChatState(ChatState.Idle);
        },
      });
    }
  };

  return (
    <div className='fixed inset-0 lg:static bg-main-gradient lg:bg-transparent flex-1 z-20 flex flex-col shadow-top overflow-hidden md:rounded-xl'>
      {/* chat header */}
      <ChatTopBar chat={chat} />
      {/* chat messages scroll */}
      <ChatBody
        messages={messages}
        isLoadingMessages={isLoading}
        loadMoreMessages={fetchNextPage}
        isLoading={isFetchingNextPage}
        hasMore={hasNextPage}
      />
      {/* chat input field  */}
      <ChatBottomBar chat={chat} />
    </div>
  );
};

export default MessagesMode;
