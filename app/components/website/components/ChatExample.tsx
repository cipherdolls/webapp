import { useEffect, useRef, useState } from 'react';
import AvatarPicture from '~/components/AvatarPicture';
import { PICTURE_SIZE } from '~/constants';
import type { Avatar } from '~/types';

const ChatExample = ({ avatar }: { avatar: Avatar }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const chatMessages = [
    {
      type: 'ai',
      text: "Hello! I'm your anonymous AI assistant. How can I help you today?",
      delay: 0,
    },
    {
      type: 'user',
      text: 'Can you help me with creative writing?',
      delay: 1500,
    },
    {
      type: 'ai',
      text: "Absolutely! I'd love to help with your creative writing. What type of story or content are you working on?",
      delay: 1500,
    },
    {
      type: 'user',
      text: "I'm working on a sci-fi thriller about AI consciousness",
      delay: 1500,
    },
    {
      type: 'ai',
      text: "Fascinating topic! Let's explore themes of identity, consciousness, and what makes us human. Would you like to start with character development or plot structure?",
      delay: 1500,
    },
  ];

  // Auto-scroll to bottom when messages change or typing indicator appears
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [displayedMessages, isTyping]);

  useEffect(() => {
    if (currentMessageIndex >= chatMessages.length) {
      return; // Stop animation when all messages are shown
    }

    const currentMessage = chatMessages[currentMessageIndex];
    const timer = setTimeout(() => {
      if (currentMessage.type === 'ai') {
        setIsTyping(true);
        // Show typing indicator for AI messages
        setTimeout(() => {
          setDisplayedMessages((prev) => [...prev, currentMessage]);
          setIsTyping(false);
          setCurrentMessageIndex((prev) => prev + 1);
        }, 800);
      } else {
        // User messages appear immediately
        setDisplayedMessages((prev) => [...prev, currentMessage]);
        setCurrentMessageIndex((prev) => prev + 1);
      }
    }, currentMessage.delay);

    return () => clearTimeout(timer);
  }, [currentMessageIndex]);

  return (
    <div className='bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 shadow-sm'>
      {/* Chat Header */}
      <div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-200/50'>
        <div className='flex items-center space-x-3'>
          <div className='w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center'>
            <AvatarPicture avatar={avatar} sizeType={PICTURE_SIZE.semiMedium} className='size-full shrink-0' />
          </div>
          <div>
            <div className='font-black text-gray-900 text-2xl'>{avatar.name}</div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className='space-y-4 mb-6 h-[300px] overflow-y-auto scrollbar-hide'>
        {displayedMessages.map((message, index) => (
          <div
            key={index}
            className={`animate-fade-in ${
              message.type === 'ai'
                ? 'bg-gray-100/80 rounded-2xl p-4 text-sm text-gray-700 max-w-xs'
                : 'bg-black text-white rounded-2xl p-4 text-sm ml-auto max-w-xs'
            }`}
          >
            {message.text}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className='bg-gray-100/80 rounded-2xl p-4 text-sm text-gray-700 max-w-xs animate-fade-in'>
            <div className='flex space-x-1'>
              <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
              <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0.1s' }}></div>
              <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Info */}
      <div className='bg-green-50/80 rounded-xl p-3 text-center'>
        <div className='text-xs text-green-700 font-medium'>Pay with LOV tokens</div>
        <div className='text-xs text-green-600'>Only pay for messages you send</div>
      </div>
    </div>
  );
};

export default ChatExample;
