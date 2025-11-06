import React, { useRef, useEffect } from 'react';
import { Play, Shield, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import * as Button from '~/components/ui/button/button';
import { useAuthStore } from '~/store/useAuthStore';
import { Link } from 'react-router';
import { ROUTES } from '~/constants';
import { useLoginModal } from '~/context/login-modal-context';

const GuestMode = () => {
  const { isAuthenticated, isUsingBurnerWallet } = useAuthStore();
  const { open } = useLoginModal();

  const containerRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLDivElement>(null);
  const expandedContentRef = useRef<HTMLDivElement>(null);

  const isVisibleRef = useRef(false);
  const isHiddenRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show popup when user scrolls 40% of the page
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercent > 40 && !isVisibleRef.current) {
        // Add a small delay to ensure smooth animation
        setTimeout(() => {
          isVisibleRef.current = true;
          if (containerRef.current) {
            containerRef.current.style.display = 'block';
            // Trigger reflow for animation
            containerRef.current.offsetHeight;
            containerRef.current.classList.remove('translate-y-full');
            containerRef.current.classList.add('translate-y-0');
          }
        }, 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleHide = () => {
    isHiddenRef.current = !isHiddenRef.current;

    if (containerRef.current) {
      if (isHiddenRef.current) {
        containerRef.current.classList.remove('translate-y-0');
        containerRef.current.classList.add('translate-y-full');
      } else {
        containerRef.current.classList.remove('translate-y-full');
        containerRef.current.classList.add('translate-y-0');
      }
    }

    if (toggleButtonRef.current) {
      const chevronUp = toggleButtonRef.current.querySelector('.chevron-up');
      const chevronDown = toggleButtonRef.current.querySelector('.chevron-down');

      if (isHiddenRef.current) {
        toggleButtonRef.current.classList.remove('-translate-y-full');
        chevronUp?.classList.remove('hidden');
        chevronDown?.classList.add('hidden');
      } else {
        toggleButtonRef.current.classList.remove('translate-y-0');
        chevronUp?.classList.add('hidden');
        chevronDown?.classList.remove('hidden');
      }
    }
  };

  if (isAuthenticated && !isUsingBurnerWallet) {
    return null;
  }

  return (
    <>
      {/* Toggle Button - Always visible when popup is active */}

      <div
        ref={containerRef}
        className='fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out translate-y-full'
        style={{ display: 'none' }}
      >
        {/* Colored Circles Around Popup */}
        <div className='absolute inset-0 pointer-events-none overflow-visible'>
          {/* Top Left */}
          <div className='absolute -top-20 -left-16 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-cyan-400/20 rounded-full animate-pulse'></div>
          <div
            className='absolute -top-8 left-20 w-16 h-16 bg-gradient-to-br from-purple-400/40 to-pink-400/25 rounded-full animate-pulse'
            style={{ animationDelay: '1s' }}
          ></div>

          {/* Top Right */}
          <div
            className='absolute -top-24 -right-12 w-40 h-40 bg-gradient-to-br from-green-400/25 to-emerald-400/20 rounded-full animate-pulse'
            style={{ animationDelay: '2s' }}
          ></div>
          <div
            className='absolute -top-4 right-32 w-20 h-20 bg-gradient-to-br from-orange-400/35 to-red-400/25 rounded-full animate-pulse'
            style={{ animationDelay: '0.5s' }}
          ></div>

          {/* Left Side */}
          <div
            className='absolute top-1/2 -left-24 w-28 h-28 bg-gradient-to-br from-indigo-400/30 to-blue-400/20 rounded-full animate-pulse'
            style={{ animationDelay: '3s' }}
          ></div>
          <div
            className='absolute top-1/4 -left-8 w-12 h-12 bg-gradient-to-br from-pink-400/40 to-rose-400/30 rounded-full animate-pulse'
            style={{ animationDelay: '1.5s' }}
          ></div>

          {/* Right Side */}
          <div
            className='absolute top-1/3 -right-20 w-36 h-36 bg-gradient-to-br from-teal-400/25 to-cyan-400/20 rounded-full animate-pulse'
            style={{ animationDelay: '2.5s' }}
          ></div>
          <div
            className='absolute top-2/3 -right-6 w-14 h-14 bg-gradient-to-br from-yellow-400/35 to-orange-400/25 rounded-full animate-pulse'
            style={{ animationDelay: '0.8s' }}
          ></div>

          {/* Bottom */}
          <div
            className='absolute -bottom-16 left-1/4 w-24 h-24 bg-gradient-to-br from-violet-400/30 to-purple-400/20 rounded-full animate-pulse'
            style={{ animationDelay: '4s' }}
          ></div>
          <div
            className='absolute -bottom-8 right-1/3 w-18 h-18 bg-gradient-to-br from-emerald-400/35 to-green-400/25 rounded-full animate-pulse'
            style={{ animationDelay: '1.2s' }}
          ></div>
        </div>

        <div
          ref={expandedContentRef}
          className='bg-gradient-to-br from-blue-400/95 via-purple-400/90 to-pink-400/85 backdrop-blur-xl border-t border-white/20 shadow-2xl max-w-6xl mx-auto px-6 py-6 rounded-t-3xl'
        >
          <div ref={toggleButtonRef} className='absolute bottom-full left-1/2 -translate-x-1/2 transform mb-4'>
            <button
              onClick={handleToggleHide}
              className='bg-gradient-to-br from-blue-400/95 via-purple-400/90 to-pink-400/85 backdrop-blur-xl border-x border-t border-white/20 rounded-2xl px-6 py-3 flex items-center gap-3 whitespace-nowrap'
            >
              <span className='text-base text-white font-semibold'>Try Guest Mode</span>
              <ChevronUp className='w-6 h-6 text-white hidden chevron-up' />
              <ChevronDown className='w-6 h-6 text-white chevron-down' />
            </button>
          </div>
          {/* Floating Elements */}
          <div className='absolute top-2 left-8 w-4 h-4 bg-green-400/40 rounded-full animate-pulse pointer-events-none'></div>
          <div
            className='absolute top-4 right-12 w-3 h-3 bg-emerald-400/40 rounded-full animate-pulse pointer-events-none'
            style={{ animationDelay: '1s' }}
          ></div>
          <div className='absolute top-2 left-1/2 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse pointer-events-none' style={{ animationDelay: '2s' }}></div>

          {/* Content Grid */}
          <div className='flex flex-col md:flex-row items-center gap-4'>
            {/* Left - Header Info */}

            <div className='flex items-center justify-between gap-8 flex-1'>
              {/* Left Side - Icon & Text */}
              <div className='flex items-center gap-6 flex-1'>
                <div className='relative w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl border border-white/20 group hover:scale-110 transition-transform duration-300'>
                  <div className='absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
                  <Zap className='w-8 h-8 text-white relative z-10 drop-shadow-lg pointer-events-none' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-2xl font-bold text-white mb-1 drop-shadow-lg'>Try Guest Mode</h3>
                  <p className='text-white/90 text-base drop-shadow-md'>
                    Experience anonymous AI conversations instantly. No signup required.
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div>
              <Button.Root size='lg' variant='white' className='px-10 md:px-20' onClick={open}>
                {isUsingBurnerWallet ? 'Continue as a Guest' : 'Start a Guest Chat'}
              </Button.Root>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuestMode;
