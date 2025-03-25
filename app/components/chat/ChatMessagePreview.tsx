import { useState } from 'react';
import { ChatBubble } from './ui/ChatBubble';
import { backendUrl } from '~/constants';
import PlayerButton from '../PlayerButton';
import { cn } from '~/utils/cn';
import type { Message } from '~/types';

const ChatMessagePreview = ({ message }: { message: Message }) => {
  const [showFull, setShowFull] = useState(false);

  return (
    <div className='relative'>
      <div
        className={cn(
          'shrink-0 px-10 py-6 min-h-[140px] h-[140px] rounded-xl overflow-hidden bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48 cursor-pointer',
          showFull && 'h-auto'
        )}
        onClick={() => setShowFull((prev) => !prev)}
      >
        <div
          className={cn(
            'absolute inset-0 top-5 z-20 bg-linear-to-t from-[rgba(254,253,248,1)] to-[rgba(255,255,255,0)]',
            showFull && 'hidden'
          )}
        ></div>
        <ChatBubble.Root className='!mt-0'>
          <ChatBubble.Message className='!max-w-full w-full'>
            <ChatBubble.Text>{message.content}</ChatBubble.Text>
            {message.role !== 'SYSTEM' && <ChatBubble.Timestamp time={message.createdAt} />}
          </ChatBubble.Message>
        </ChatBubble.Root>
      </div>

      {/* // sound button */}
      {message.fileName && (
        <PlayerButton
          audioSrc={`${backendUrl}/messages/${message.id}/audio`}
          variant='white'
          className='absolute left-1/2 bottom-4 -translate-x-1/2 shadow-bottom'
        />
      )}
    </div>
  );
};

export default ChatMessagePreview;
