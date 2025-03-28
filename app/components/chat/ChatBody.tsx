import React, { Fragment } from 'react';
import ChatMessagesList from './ui/ChatMessagesList';
import type { Message } from '~/types';
import { ChatBubble } from '~/components/chat/ui/ChatBubble';
import { isNewDay } from '~/utils/date.utils';
import ChatDateDivider from './ui/ChatDateDivider';
import { Link } from 'react-router';

interface ChatBodyProps {
  messages: Message[];
}

const ChatBody: React.FC<ChatBodyProps> = ({ messages }) => {
  return (
    <ChatMessagesList>
      {messages.map((message, index) => {
        const bubbleVariant = message.role === 'SYSTEM' ? 'system' : message.role === 'USER' ? 'sent' : 'received';
        const isSystemMessage = message.role === 'SYSTEM';
        const isNextDay = isNewDay(messages[index - 1]?.createdAt, message.createdAt);
        if(!message.content) return null;
        return (
          <Fragment key={message.id}>
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
          </Fragment>
        );
      })}
      {/* Loading state */}
      {/* { (
        <ChatBubble.Root>
          <ChatBubble.Message isLoading />
        </ChatBubble.Root>
      )} */}
    </ChatMessagesList>
  );
};

export default ChatBody;
