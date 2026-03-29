import React, { useCallback, useLayoutEffect, useRef } from 'react';
import type { Message } from '~/types';
import { ChatBubble } from '~/components/chat/ui/ChatBubble';
import { isNewDay } from '~/utils/date.utils';
import ChatDateDivider from './ui/ChatDateDivider';
import { Link } from 'react-router';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { Icons } from '../ui/icons';
import { cn } from '~/utils/cn';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';

interface ChatBodyProps {
  messages: Message[];
  loadMoreMessages: () => void;
  isLoading: boolean;
  isLoadingMessages: boolean;
  hasMore: boolean;
}

function MessagesLoader() {
  return (
    <div className='flex flex-col mx-auto w-full h-full'>
      <Icons.loader className='mx-auto my-auto size-10 animate-spin text-neutral-01' />
    </div>
  );
}

const ChatBody: React.FC<ChatBodyProps> = ({ messages, isLoadingMessages, loadMoreMessages, isLoading, hasMore }) => {
  const scrollableRootRef = useRef<React.ComponentRef<'div'> | null>(null);
  const lastScrollDistanceToBottomRef = useRef<number>(0);
  const lastMessageIdRef = useRef<string | null>(null);
  const knownMessageIdsRef = useRef<Set<string>>(new Set());

  const { processingMessageId, showTypingIndicator } = useChatStore(
    useShallow((state) => ({
      processingMessageId: state.processingMessageId,
      showTypingIndicator: state.showTypingIndicator,
    }))
  );

  // Show AI typing indicator only after user message is confirmed
  const isAiTyping = showTypingIndicator;

  // Track which messages are new (for animation)
  const newMessageIds = new Set<string>();
  messages.forEach((msg) => {
    if (!knownMessageIdsRef.current.has(msg.id)) {
      newMessageIds.add(msg.id);
      knownMessageIdsRef.current.add(msg.id);
    }
  });

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage: hasMore,
    onLoadMore: () => loadMoreMessages(),
    disabled: !hasMore,
    delayInMs: 200,
  });

  useLayoutEffect(() => {
    const scrollableRoot = scrollableRootRef.current;
    if (!scrollableRoot) return;

    // Scroll to bottom when AI starts typing
    if (isAiTyping) {
      scrollableRoot.scrollTop = scrollableRoot.scrollHeight;
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.id !== lastMessageIdRef.current) {
      lastMessageIdRef.current = lastMessage?.id || null;
      scrollableRoot.scrollTop = scrollableRoot.scrollHeight;
    } else {
      const lastScrollDistanceToBottom = lastScrollDistanceToBottomRef.current;
      scrollableRoot.scrollTop = scrollableRoot.scrollHeight - lastScrollDistanceToBottom;
    }
  }, [messages, isAiTyping]);

  const rootRefSetter = useCallback(
    (node: HTMLDivElement) => {
      rootRef(node);
      scrollableRootRef.current = node;
    },
    [rootRef]
  );

  const handleRootScroll = useCallback(() => {
    const rootNode = scrollableRootRef.current;
    if (rootNode) {
      const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
      lastScrollDistanceToBottomRef.current = scrollDistanceToBottom;
    }
  }, []);

  return (
    <div className='flex-1 flex overflow-auto shrink-0'>
      <div
        ref={rootRefSetter}
        onScroll={handleRootScroll}
        className='flex-1 overflow-auto scrollbar scrollbar-medium bg-white rounded-t-xl lg:rounded-none'
      >
        {hasMore && !isLoadingMessages && (
          <div
            ref={infiniteRef}
            className={cn('flex justify-center items-center py-5', {
              'h-full': messages.length === 0,
            })}
          >
            <Icons.loader className='size-10 animate-spin text-neutral-01' />
          </div>
        )}

        {isLoadingMessages ? (
          <MessagesLoader />
        ) : (
          <>
            {messages.map((message, index) => {
              const isNextDay = isNewDay(messages[index - 1]?.createdAt, message.createdAt);
              return (
                <ChatBubbleComponent
                  key={message.id}
                  message={message}
                  isNextDay={isNextDay}
                  isProcessing={message.id === processingMessageId}
                  isNew={newMessageIds.has(message.id)}
                />
              );
            })}

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <ChatBubble.Root variant='received'>
                <ChatBubble.Message isLoading />
              </ChatBubble.Root>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBody;

const ChatBubbleComponent = React.memo<{ message: Message; isNextDay: boolean; isProcessing?: boolean; isNew?: boolean }>(
  ({ message, isNextDay, isProcessing = false, isNew = false }) => {
    const bubbleVariant = message.role === 'SYSTEM' ? 'system' : message.role === 'USER' ? 'sent' : 'received';

    if (!message.content) return null;

    return (
      <>
        {/* divider between days */}
        {isNextDay && <ChatDateDivider date={message.createdAt} />}
        {/* chat bubble */}
        <ChatBubble.Root variant={bubbleVariant} className={isNew && bubbleVariant === 'received' ? 'animate-fade-in' : ''}>
          <ChatBubble.Message asChild isProcessing={isProcessing && bubbleVariant === 'sent'}>
            <div>
              <Link to={`messages/${message.id}`} className='block -mx-4 -my-3 px-4 py-3'>
                <ChatBubble.Text>{message.content}</ChatBubble.Text>
              </Link>
            </div>
          </ChatBubble.Message>
        </ChatBubble.Root>
      </>
    );
  }
);

ChatBubbleComponent.displayName = 'ChatBubbleComponent';
