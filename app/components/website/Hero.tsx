
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, Zap } from 'lucide-react';
import * as Button from '~/components/ui/button/button';

const Hero = () => {
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
    <section className='pt-24 pb-16 min-h-screen flex items-center'>
      <div className='container'>
        <div className='grid lg:grid-cols-2 gap-16 items-center'>
          {/* Left Column - Content */}
          <div className='space-y-8'>
            {/* Badge */}
            <div className='inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200/50'>
              <Shield className='w-4 h-4 text-green-600' />
              <span>100% Anonymous & Private</span>
            </div>

            {/* Headline */}
            <div className='space-y-6'>
              <h1 className='text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 leading-tight'>
                Where Privacy Meets
                <br />
                <span className='font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                  Anonymous AI Chat
                </span>
              </h1>
              <p className='text-lg text-gray-600 leading-relaxed max-w-xl'>
                Chat with avatars without compromising your privacy. No email, no personal data, no subscriptions. Pay only for what you use
                with LOV tokens.
              </p>
            </div>

            {/* Features */}
            <div className='flex flex-col sm:flex-row gap-6'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                  <Shield className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <div className='font-medium text-gray-900'>No Personal Data</div>
                  <div className='text-sm text-gray-600'>Completely anonymous</div>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                  <Zap className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <div className='font-medium text-gray-900'>Pay Per Message</div>
                  <div className='text-sm text-gray-600'>No subscriptions</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button.Root className='px-10 gradient-move font-medium' variant='secondary' size='lg'>
                Start Chat for Free
                <ArrowRight />
              </Button.Root>
              <Button.Root className='px-5' size='lg'>
                Learn More
              </Button.Root>
            </div>
          </div>

          {/* Right Column - Demo Interface */}
          <div className='relative'>
            <div className='bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 shadow-sm'>
              {/* Chat Header */}
              <div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-200/50'>
                <div className='flex items-center space-x-3'>
                  <div className='w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center'>
                    {/* <img src={freyaImage} alt='Freya' className='w-14 h-14 rounded-full object-cover' /> */}
                  </div>
                  <div>
                    <div className='font-black text-gray-900 text-2xl'>Freya</div>
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
