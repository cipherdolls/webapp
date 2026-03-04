import type { Avatar, Chat } from '~/types';
import ChatTopBar from '~/components/chat/ChatTopBar';
import ChatBottomBar from '~/components/chat/ChatBottomBar';
import ChatBody from '~/components/chat/ChatBody';
import { useChatEvents } from '~/hooks/useChatEvents';
import { useEffect, useRef } from 'react';
import { ChatState } from '~/components/chat/types/chatState';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';
import { useAudioPlayerContext } from 'react-use-audio-player';
import { useUnmount } from 'usehooks-ts';
import { useInfiniteMessages } from '~/hooks/queries/messageQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useStreamRecorder } from '~/hooks/useStreamRecorder';
import { useStreamPlayer } from '~/hooks/useStreamPlayer';
import { useWebSocketAudioPlayer } from '~/hooks/useWebSocketAudioPlayer';

interface MessagesModeProps {
  chat: Chat;
  avatar: Avatar;
}

const MessagesMode = ({ chat, avatar }: MessagesModeProps) => {
  const { stop } = useAudioPlayerContext();
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

  const ttsCallbacks = useWebSocketAudioPlayer({
    onPlaybackEnd: () => setCurrentChatState(ChatState.Idle),
  });

  const streamPlayer = useStreamPlayer(chat.id, ttsCallbacks);
  const streamRecorder = useStreamRecorder(chat.id);

  useEffect(() => {
    streamPlayer.connect().catch((err) => console.error('[MessagesMode] Stream player connect failed', err));
    streamRecorder.connect().catch((err) => console.error('[MessagesMode] Stream recorder connect failed', err));
  }, [streamPlayer.connect, streamRecorder.connect]);

  useUnmount(() => {
    streamPlayer.disconnect();
    streamRecorder.disconnect();
    stop();
  });

  useChatEvents(chat.id, {
    onProcessEvent: (event) => {
      if (event.resourceName === 'Message') {
        switch (event.jobName) {
          case 'created':
            if (event.jobStatus === 'completed') {
              queryClient.invalidateQueries({ queryKey: ['messages', chat.id] });
              const currentProcessingId = useChatStore.getState().processingMessageId;
              if (currentProcessingId) {
                if (!userMessageIdRef.current || currentProcessingId.startsWith('temp-')) {
                  userMessageIdRef.current = event.resourceId;
                  setShowTypingIndicator(true);
                } else if (event.resourceId !== userMessageIdRef.current) {
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
  });

  useEffect(() => {
    if (silentMode && currentChatState === ChatState.avatarSpeaking) {
      stop();
      setCurrentChatState(ChatState.Idle);
    }
  }, [silentMode]);

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
      <ChatBottomBar chat={chat} streamRecorder={streamRecorder} streamPlayer={streamPlayer} />
    </div>
  );
};

export default MessagesMode;
