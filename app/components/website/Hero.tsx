import { ArrowRight, Shield, Zap, ArrowDown } from 'lucide-react';
import * as Button from '~/components/ui/button/button';
import type { Avatar } from '~/types';
import ChatExample from './components/ChatExample';
import { useWalletAuth } from '~/hooks/useWalletAuth';
import { useAuthStore } from '~/store/useAuthStore';
import { useNavigate } from 'react-router';
import { ROUTES } from '~/constants';

const content = {
  title: 'Where Privacy Meets',
  subtitle: 'Anonymous AI Chat',
  description:
    'Chat with avatars without compromising your privacy. No email, no personal data, no subscriptions. Pay only for what you use with LOV tokens.',
  features: [
    {
      icon: <Shield className='w-4 h-4 text-green-600' />,
      title: 'No Personal Data',
      description: 'Completely anonymous',
    },
    {
      icon: <Zap className='w-4 h-4 text-blue-600' />,
      title: 'Pay Per Message',
      description: 'No subscriptions',
    },
  ],
  cta: {
    text: 'Start Chat for Free',
    href: '/chat',
  },
  learnMore: {
    text: 'Learn More',
    href: '/learn-more',
  },
};

const Hero = ({ avatar }: { avatar: Avatar }) => {
  const { signIn, isLoading, hasEthereum } = useWalletAuth();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleStartChat = async () => {
    if (isAuthenticated) {
      navigate(ROUTES.chats);
    } else {
      await signIn();
    }
  };

  return (
    <section className='pt-24 pb-16 min-h-screen flex items-center'>
      <div className='container'>
        <div className='grid lg:grid-cols-2 gap-16 items-center'>
          {/* Left Column - Content */}
          <div className='space-y-8'>
            {/* Badge */}
            <div className='inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200/50'>
              <Shield className='w-4 h-4 text-green-600' />
              <span>{content.subtitle}</span>
            </div>

            {/* Headline */}
            <div className='space-y-6'>
              <h1 className='text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 leading-tight'>
                {content.title}
                <br />
                <span className='font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                  {content.subtitle}
                </span>
              </h1>
              <p className='text-lg text-gray-600 leading-relaxed max-w-xl'>{content.description}</p>
            </div>

            {/* Features */}
            <div className='flex flex-col sm:flex-row gap-6'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>{content.features[0].icon}</div>
                <div>
                  <div className='font-medium text-gray-900'>{content.features[0].title}</div>
                  <div className='text-sm text-gray-600'>{content.features[0].description}</div>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>{content.features[1].icon}</div>
                <div>
                  <div className='font-medium text-gray-900'>{content.features[1].title}</div>
                  <div className='text-sm text-gray-600'>{content.features[1].description}</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-5'>
              <Button.Root
                className='px-10 gradient-move font-medium'
                variant='secondary'
                size='lg'
                onClick={handleStartChat}
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : content.cta.text}
                <ArrowRight />
              </Button.Root>
              <Button.Root
                className='group px-6'
                size='lg'
                variant='secondary'
                onClick={() => {
                  document.getElementById('sectionHowItWorks')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {content.learnMore.text}
                <ArrowDown className=' ml-2 inline-block transition-transform duration-300 -translate-y-0.5 group-hover:translate-y-0.5 animate-none' />
              </Button.Root>
            </div>
          </div>

          {/* Right Column - Demo Interface */}
          <div className='relative'>
            <ChatExample avatar={avatar} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
