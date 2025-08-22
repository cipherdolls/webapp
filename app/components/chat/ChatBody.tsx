import React, { Fragment, useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { Message } from '~/types';
import { ChatBubble } from '~/components/chat/ui/ChatBubble';
import { isNewDay } from '~/utils/date.utils';
import ChatDateDivider from './ui/ChatDateDivider';
import { Link } from 'react-router';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { Icons } from '../ui/icons';
import { cn } from '~/utils/cn';

interface ChatBodyProps {
  messages: Message[];
  loadMoreMessages: () => void;
  isLoading: boolean;
  isLoadingMessages: boolean;
  hasMore: boolean;
}

function MessagesSkeleton() {
  return (
    <div className='flex flex-col mx-auto max-w-[900px] animate-pulse'>
      <div className='flex justify-start px-4.5 pb-4 mt-4'>
        <div className='relative min-h-12 px-4 py-3 rounded-xl w-full max-w-[240px] bg-neutral-05 [&]:after:message-corner [&]:after:top-[-3px] [&]:after:left-[-7px] [&]:after:text-neutral-05' />
      </div>

      <div className='flex justify-end px-4.5 pb-4 mt-4'>
        <div className='flex gap-2 items-end w-full pb-4 min-h-12 relative px-4 py-3 rounded-xl max-w-[300px] bg-pink-02 [&]:after:message-corner [&]:after:top-[-3px] [&]:after:right-[-7px] [&]:after:scale-x-[-1] [&]:after:text-pink-02' />
      </div>

      <div className='flex justify-start px-4.5 pb-4 mt-4'>
        <div className='relative min-h-12 w-full px-4 py-3 rounded-xl max-w-[440px] bg-neutral-05 [&]:after:message-corner [&]:after:top-[-3px] [&]:after:left-[-7px] [&]:after:text-neutral-05' />
      </div>

      <div className='flex  justify-end px-4.5 pb-4 mt-4'>
        <div className='flex gap-2 items-end w-full pb-4 min-h-12 relative px-4 py-3 rounded-xl max-w-[160px] bg-pink-02 [&]:after:message-corner [&]:after:top-[-3px] [&]:after:right-[-7px] [&]:after:scale-x-[-1] [&]:after:text-pink-02' />
      </div>

      <div className='flex justify-start px-4.5 pb-4 mt-4'>
        <div className='relative min-h-12 px-4 w-full py-3 rounded-xl max-w-[360px] bg-neutral-05  [&]:after:message-corner [&]:after:top-[-3px] [&]:after:left-[-7px] [&]:after:text-neutral-05' />
      </div>

      <div className='flex justify-end px-4.5 pb-4 mt-4'>
        <div className='flex gap-2 items-end w-full pb-4 min-h-12 relative px-4 py-3 rounded-xl max-w-[260px] bg-pink-02 [&]:after:message-corner [&]:after:top-[-3px] [&]:after:right-[-7px] [&]:after:scale-x-[-1] [&]:after:text-pink-02' />
      </div>

      <ChatBubble.Root>
        <ChatBubble.Message isLoading />
      </ChatBubble.Root>
    </div>
  );
}

const ChatBody: React.FC<ChatBodyProps> = ({ messages, isLoadingMessages, loadMoreMessages, isLoading, hasMore }) => {
  const scrollableRootRef = useRef<React.ComponentRef<'div'> | null>(null);
  const lastScrollDistanceToBottomRef = useRef<number>(0);
  const prevMessagesLengthRef = useRef<number>(0);
  const lastMessageIdRef = useRef<string | null>(null);
  const [isShouldShowChatBubble, setIsShouldShowChatBubble] = useState(false);

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

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.id !== lastMessageIdRef.current) {
      lastMessageIdRef.current = lastMessage?.id || null;
      scrollableRoot.scrollTop = scrollableRoot.scrollHeight;
    } else {
      const lastScrollDistanceToBottom = lastScrollDistanceToBottomRef.current;
      scrollableRoot.scrollTop = scrollableRoot.scrollHeight - lastScrollDistanceToBottom;
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, rootRef]);

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
        {hasMore && (
          <div
            ref={infiniteRef}
            className={cn('flex justify-center items-center py-5', {
              'h-full': messages.length === 0,
            })}
          >
            <Icons.loader className='size-10 animate-spin text-neutral-01' />
          </div>
        )}
        {isLoadingMessages ? <MessagesSkeleton /> : messages.map((message, index) => {
          const isNextDay = isNewDay(messages[index - 1]?.createdAt, message.createdAt);
          return <ChatBubbleComponent key={message.id} message={message} isNextDay={isNextDay} />;
        })}

        {isShouldShowChatBubble && (
          <ChatBubble.Root>
            <ChatBubble.Message isLoading />
          </ChatBubble.Root>
        )}
      </div>
    </div>
  );
};

export default ChatBody;

const ChatBubbleComponent = React.memo<{ message: Message; isNextDay: boolean }>(({ message, isNextDay }) => {
  const bubbleVariant = message.role === 'SYSTEM' ? 'system' : message.role === 'USER' ? 'sent' : 'received';
  const isSystemMessage = message.role === 'SYSTEM';

  if (!message.content) return null;
  return (
    <>
      {/* divider between days */}
      {isNextDay && <ChatDateDivider date={message.createdAt} />}
      {/* chat bubble */}
      <ChatBubble.Root variant={bubbleVariant}>
        <ChatBubble.Message asChild>
          <Link to={`messages/${message.id}`}>
            <ChatBubble.Text>{message.content}</ChatBubble.Text>
            {!isSystemMessage && <ChatBubble.Timestamp time={message.createdAt} />}
          </Link>
        </ChatBubble.Message>
      </ChatBubble.Root>
    </>
  );
});

ChatBubbleComponent.displayName = 'ChatBubbleComponent';
