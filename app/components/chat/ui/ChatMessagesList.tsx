import React from 'react';
import { useAutoScroll } from '~/hooks/useAutoScroll';

interface ChatMessagesListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
}

const ChatMessagesList: React.FC<ChatMessagesListProps> = ({ children, smooth, ...props }) => {
  const { scrollRef, isAtBottom, scrollToBottom, disableAutoScroll } = useAutoScroll({
    smooth,
    content: children,
  });

  return (
    <div
      ref={scrollRef}
      className='flex-1 overflow-auto scrollbar scrollbar-medium bg-white rounded-t-xl lg:rounded-none'
      onWheel={disableAutoScroll}
      onTouchMove={disableAutoScroll}
      {...props}
    >
      <div className='py-16'>{children}</div>
    </div>
  );
};

export default ChatMessagesList;
