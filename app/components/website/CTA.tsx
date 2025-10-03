import { ArrowRight } from 'lucide-react';
import * as Button from '~/components/ui/button/button';
import { useWalletAuth } from '~/hooks/useWalletAuth';
import { useAuthStore } from '~/store/useAuthStore';
import { useNavigate } from 'react-router';
import { ROUTES } from '~/constants';

const content = {
  title: (
    <>
      Your Adventure Awaits
      <br />
      <span className='font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
        Ready to Start Chatting?
      </span>
    </>
  ),
  description: 'No email, no personal data, no subscriptions. Just private AI conversations.',
};

const CTA = () => {
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
    <section className='py-40'>
      <div className='container'>
        <div className='relative mx-auto max-w-5xl'>
          {/* Floating Elements */}
          <div className='absolute -top-4 -left-4 w-8 h-8 bg-purple-400/30 rounded-full animate-pulse'></div>
          <div
            className='absolute -top-2 -right-6 w-6 h-6 bg-pink-400/30 rounded-full animate-pulse'
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className='absolute -bottom-4 left-1/4 w-4 h-4 bg-blue-400/30 rounded-full animate-pulse'
            style={{ animationDelay: '2s' }}
          ></div>
          <div
            className='absolute -bottom-2 right-1/3 w-5 h-5 bg-green-400/30 rounded-full animate-pulse'
            style={{ animationDelay: '0.5s' }}
          ></div>

          {/* Main CTA Container */}
          <div className='bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-12 shadow-sm'>
            <div className='relative'>
              {/* Horizontal Layout */}
              <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8'>
                {/* Left Side - Content */}
                <div className='flex-1 text-left'>
                  {/* Headline */}
                  <h2 className='text-3xl sm:text-4xl font-light text-gray-900 mb-4 leading-tight'>{content.title}</h2>

                  {/* Description */}
                  <p className='text-lg text-gray-600 leading-relaxed'>{content.description}</p>
                </div>

                {/* Right Side - CTA Button */}
                <div className='flex-shrink-0'>
                  <Button.Root
                    className='gradient-move px-8 transition-all duration-300 ease-in-out flex hover:shadow-xl hover:scale-105'
                    size='lg'
                    onClick={handleStartChat}
                    disabled={isLoading}
                  >
                    <span className='font-medium'>{isLoading ? 'Connecting...' : 'Start Chat for Free'}</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button.Root>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
