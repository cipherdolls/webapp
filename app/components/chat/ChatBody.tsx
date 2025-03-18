import React, { Fragment } from 'react';
import ChatMessagesList from './ui/ChatMessagesList';
import type { Message } from '~/types';
import { ChatBubble } from '~/components/chat/ui/ChatBubble';
import { isNewDay } from '~/utils/date.utils';
import ChatDateDivider from './ui/ChatDateDivider';

interface ChatBodyProps {
  messages: Message[];
  isGenerating?: boolean;
}


const getMessageVariant = (role: string) => {
  switch (role) {
    case 'USER':
      return 'sent';
    case 'ASSISTANT':
      return 'received';
    case 'SYSTEM':
      return 'system';
    default:
      return 'received';
  }
};


const ChatBody: React.FC<ChatBodyProps> = ({ messages, isGenerating = false }) => {
  return (
    <ChatMessagesList>
      {messages.map((message, index) => {
        const variant = getMessageVariant(message.role);
        const isNextDay = isNewDay(messages[index - 1]?.createdAt, message.createdAt);
        return (
          <Fragment key={message.id}>
            {/* divider between days */}
            {isNextDay && <ChatDateDivider date={message.createdAt} />}

            {/* chat bubble */}
            <ChatBubble.Root variant={variant} >
              <ChatBubble.Message>
                <ChatBubble.Text>{message.content}</ChatBubble.Text>
                {message.role !== 'SYSTEM' && <ChatBubble.Timestamp time={message.createdAt} />}
              </ChatBubble.Message>
            </ChatBubble.Root>
          </Fragment>
        );
      })}
      {/* Loading state */}
      {isGenerating && (
        <ChatBubble.Root>
          <ChatBubble.Message isLoading />
        </ChatBubble.Root>
      )}
    </ChatMessagesList>
  );
};

export default ChatBody;
