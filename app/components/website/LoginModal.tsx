import { useLoginModal } from '~/context/login-modal-context';
import { useWalletAuth } from '~/hooks/useWalletAuth';
import { useAuthStore } from '~/store/useAuthStore';
import * as Dialog from '@radix-ui/react-dialog';
import { Zap, X, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn, cnExt } from '~/utils/cn';
import { ROUTES, LANGUAGES } from '~/constants';
import { useLocation, useNavigate } from 'react-router';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { Gender } from '~/types';
import { motion } from 'framer-motion';

const GUEST_MODE_BULLETS = [
  {
    title: 'Instant Access',
    description: 'Start chatting now',
    icon: (
      <div className='w-5 h-5 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
        <div className='w-2 h-2 bg-cyan-500 rounded-full'></div>
      </div>
    ),
  },
  {
    title: 'Anonymous',
    description: 'No signup required',
    icon: (
      <div className='w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
      </div>
    ),
  },
  {
    title: 'Burner Wallet Login',
    description: 'Data saved in your browser',
    icon: (
      <div className='w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
        <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
      </div>
    ),
  },
  {
    title: 'No Tokens Needed',
    description: 'Start chatting for free',
    icon: (
      <div className='w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
        <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
      </div>
    ),
  },
];

const METAMASK_MODE_BULLETS = [
  {
    title: 'Anonymous',
    description: 'No signup required',
    icon: (
      <div className='w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
      </div>
    ),
  },
  {
    title: 'Secure',
    description: 'Your data is safe',
    icon: (
      <div className='w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
        <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
      </div>
    ),
  },
  {
    title: 'Rewards & Earnings',
    description: 'Create content to earn & withdraw money',
    icon: (
      <div className='w-5 h-5 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
        <div className='w-2 h-2 bg-cyan-500 rounded-full'></div>
      </div>
    ),
  },
  {
    title: 'AI Powered',
    description: 'Smart conversations',
    icon: (
      <div className='w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
        <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
      </div>
    ),
  },
  {
    title: 'Sync With Devices',
    description: 'Sync your data across devices',
    icon: (
      <div className='w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
        <div className='w-2 h-2 bg-red-500 rounded-full'></div>
      </div>
    ),
  },
  {
    title: 'Content Coverage',
    description: '100+ Scenarios & Avatars for use',
    icon: (
      <div className='w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
        <div className='w-2 h-2 bg-pink-500 rounded-full'></div>
      </div>
    ),
  },
];

const LoginModal = () => {
  const [isLoadingMetamask, setIsLoadingMetamask] = useState(false);
  const [isLoadingGuest, setIsLoadingGuest] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestGender, setGuestGender] = useState<Gender>('Female');
  const [guestLanguage, setGuestLanguage] = useState('en');
  const location = useLocation();

  const { isOpen, close } = useLoginModal();
  const { verifyToken, isUsingBurnerWallet, isAuthenticated } = useAuthStore();
  const { signIn, signInAsGuest, isLoading, hasEthereum } = useWalletAuth();
  const navigate = useNavigate();

  const handleMetaMaskClick = async () => {
    if (!hasEthereum) {
      return;
    }

    setIsLoadingMetamask(true);
    try {
      setIsConfirmOpen(true);
      await signIn();
    } catch (error) {
      console.error('Sign in with MetaMask failed:', error);
    } finally {
      setIsConfirmOpen(false);
      setIsLoadingMetamask(false);
    }
  };

  const handleGuestClick = () => {
    if (isAuthenticated && isUsingBurnerWallet) {
      if (location.pathname === '/') {
        navigate(ROUTES.chats);
      }
      close();
      return;
    }

    setShowGuestForm(true);
  };

  const handleGuestFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      return;
    }

    setIsLoadingGuest(true);
    try {
      await signInAsGuest({
        name: guestName.trim(),
        gender: guestGender,
        language: guestLanguage,
      });
    } catch (error) {
      console.error('Sign in as guest failed:', error);
    } finally {
      setIsLoadingGuest(false);
    }
  };

  const handleBackToLogin = () => {
    setShowGuestForm(false);
    setGuestName('');
    setGuestGender('Female');
    setGuestLanguage('en');
  };

  useEffect(() => {
    if (!isOpen) {
      setIsVerifying(false);
      return;
    }

    if (isUsingBurnerWallet) return;

    let active = true;
    setIsVerifying(true);

    const verify = async () => {
      try {
        const isValid = await verifyToken();
        if (!active) return;

        if (isValid) {
          close();
          navigate(ROUTES.chats);
          return;
        }
      } catch (err) {
        console.error('Token verification failed:', err);
      } finally {
        if (active) {
          setIsVerifying(false);
        }
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [isOpen, verifyToken, navigate, close]);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={close}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-50 backdrop-blur-md animate-overlay-fade'>
          {/* Floating Bubbles */}
          <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            <div
              className='absolute top-20 left-10 w-32 h-32 bg-emerald-400/30 rounded-full animate-float'
              style={{ animationDuration: '20s' }}
            ></div>
            <div
              className='absolute top-40 right-20 w-24 h-24 bg-cyan-400/30 rounded-full animate-float'
              style={{ animationDelay: '1s', animationDuration: '22s' }}
            ></div>
            <div
              className='absolute bottom-32 left-1/4 w-40 h-40 bg-orange-400/30 rounded-full animate-float'
              style={{ animationDelay: '2s', animationDuration: '24s' }}
            ></div>
            <div
              className='absolute top-1/3 right-1/4 w-28 h-28 bg-purple-400/30 rounded-full animate-float'
              style={{ animationDelay: '0.5s', animationDuration: '26s' }}
            ></div>
            <div
              className='absolute bottom-20 right-10 w-20 h-20 bg-pink-400/30 rounded-full animate-float'
              style={{ animationDelay: '1.5s', animationDuration: '18s' }}
            ></div>
            <div
              className='absolute top-1/2 left-16 w-16 h-16 bg-blue-400/30 rounded-full animate-float'
              style={{ animationDelay: '2.5s', animationDuration: '16s' }}
            ></div>
          </div>
        </Dialog.Overlay>

        <Dialog.Content
          className={cn(
            'fixed inset-0 sm:left-[50%] sm:top-[50%] z-50 sm:translate-x-[-50%] sm:translate-y-[-50%] bg-white rounded-none sm:rounded-3xl shadow-neutral-03 shadow-2xl max-w-full md:max-w-3xl w-full h-full sm:h-fit sm:max-h-[calc(100vh-150px)] sm:overflow-y-auto focus:outline-none animate-modal-fade overflow-y-auto',
            isConfirmOpen && 'blur-xs'
          )}
        >
          <VisuallyHidden>
            <Dialog.Title>Start Your Conversation</Dialog.Title>
            <Dialog.Description>
              Choose how you'd like to get started. Connect with MetaMask for a personalized experience, or jump right in with Guest Mode.
            </Dialog.Description>
          </VisuallyHidden>

          {isVerifying ? (
            <div className='min-h-full sm:min-h-[320px] flex flex-col items-center justify-center gap-4 px-6 sm:px-8 text-center w-full'>
              <LoaderCircle className='w-10 h-10 text-emerald-500 animate-spin' />
              <div>
                <p className='text-lg font-semibold text-gray-900'>Just a moment…</p>
              </div>
            </div>
          ) : showGuestForm ? (
            <div className='flex flex-col px-6 py-10 sm:px-8 sm:py-8 w-full'>
              <Dialog.Close asChild>
                <button className='absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110'>
                  <X className='w-5 h-5 text-gray-600' />
                </button>
              </Dialog.Close>

              <div className='text-center mb-8'>
                <div className='inline-flex items-center justify-center py-5'>
                  <img src='/logo.svg' alt='Cipherdolls' className='w-48 h-auto' />
                </div>
                <p className='text-gray-600 text-base leading-relaxed'>Tell us a bit about yourself to get started with Guest Mode</p>
              </div>

              <form onSubmit={handleGuestFormSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <label htmlFor='guest-name' className='block text-sm font-semibold text-gray-900'>
                    Name
                  </label>
                  <input
                    id='guest-name'
                    type='text'
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder='Enter your name'
                    required
                    autoFocus
                    className='w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
                  />
                  <p className='text-xs text-gray-400'>This is the name the avatar will use to address you</p>
                </div>

                <div className='space-y-2'>
                  <label className='block text-sm font-semibold text-gray-900'>Gender</label>
                  <div className='relative p-1 bg-gray-100 grid grid-cols-2 rounded-xl'>
                    <button
                      type='button'
                      className='relative z-10 flex items-center justify-center py-3 text-sm font-semibold rounded-lg transition-colors'
                      onClick={() => setGuestGender('Female')}
                    >
                      👩🏻 Female
                    </button>
                    <button
                      type='button'
                      className='relative z-10 flex items-center justify-center py-3 text-sm font-semibold rounded-lg transition-colors'
                      onClick={() => setGuestGender('Male')}
                    >
                      🧔🏻‍♂ Male
                    </button>
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className={cn(
                        'absolute top-1 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-white rounded-lg shadow-sm',
                        guestGender === 'Female' ? 'left-1' : 'left-[calc(50%+3px)]'
                      )}
                    />
                  </div>
                  <p className='text-xs text-gray-400'>Choose the gender you'd like to roleplay as</p>
                </div>

                <div className='space-y-2'>
                  <label htmlFor='guest-language' className='block text-sm font-semibold text-gray-900'>
                    Language
                  </label>
                  <select
                    id='guest-language'
                    value={guestLanguage}
                    onChange={(e) => setGuestLanguage(e.target.value)}
                    className='w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer'
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.code.toUpperCase()} - {lang.name}
                      </option>
                    ))}
                  </select>
                  <p className='text-xs text-gray-400'>The language the AI will speak to you in</p>
                </div>

                <div className='grid grid-cols-2 gap-3 pt-4'>
                  <button
                    type='button'
                    onClick={handleBackToLogin}
                    disabled={isLoadingGuest}
                    className='px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Back
                  </button>
                  <button
                    type='submit'
                    disabled={isLoadingGuest || !guestName.trim()}
                    className='px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                  >
                    {isLoadingGuest ? (
                      <>
                        <LoaderCircle className='w-5 h-5 animate-spin' />
                        <span>Getting Started...</span>
                      </>
                    ) : (
                      'Get Started'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className='flex flex-col px-6 py-10 sm:px-8 sm:py-8 w-full'>
              <Dialog.Close asChild>
                <button className='absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110'>
                  <X className='w-5 h-5 text-gray-600' />
                </button>
              </Dialog.Close>

              <div className='text-center mb-8'>
                <div className='inline-flex items-center justify-center py-5'>
                  <img src='/logo.svg' alt='Cipherdolls' className='w-48 h-auto' />
                </div>
                <p className='text-gray-600 text-base leading-relaxed w-10/12 mx-auto'>
                  Choose how you'd like to log in — no crypto or tokens required. Both options give you access to free Avatars & Scenarios.
                </p>
              </div>

              {!hasEthereum ? (
                <div className='text-sm text-black/80 text-left space-y-1 rounded-2xl bg-white/80 border border-orange-300 px-4 py-3 shadow-sm mb-6'>
                  <p>
                    MetaMask extension not detected. You can{' '}
                    <a href='https://metamask.io/download/' target='_blank' rel='noopener noreferrer' className='underline font-semibold'>
                      install MetaMask
                    </a>{' '}
                    or use a Web3 browser like{' '}
                    <a href='https://brave.com/' target='_blank' rel='noopener noreferrer' className='underline font-semibold'>
                      Brave
                    </a>
                    . Or just use the <span className='font-semibold'>Burner Wallet</span> to get started instantly — no extension needed.
                  </p>
                </div>
              ) : null}

              <div className='flex justify-between gap-4'>
                <div className='flex flex-1 flex-col'>
                  <button
                    onClick={handleMetaMaskClick}
                    disabled={isLoading || !hasEthereum}
                    className={cnExt(
                      'flex flex-col items-center md:flex-row gap-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-4 md:p-6 transition-all duration-300 relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed',
                      isLoadingMetamask ? 'disabled:opacity-80' : '',
                      !hasEthereum ? 'disabled:opacity-30' : ''
                    )}
                  >
                    <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center'>
                      {isLoadingMetamask ? (
                        <div className='w-7'>
                          <LoaderCircle className='w-7 h-7 text-orange-500 animate-spin' />
                        </div>
                      ) : (
                        <img src='/metamask.svg' loading='eager' alt='MetaMask' className='w-8 h-8' />
                      )}
                    </div>
                    <div className='text-center md:text-left'>
                      <div className='font-bold text-lg'>External Wallet</div>
                      <div className='text-white/90 text-sm'>Connect MetaMask or Web3 wallet</div>
                    </div>
                  </button>

                  <div className='py-6'>
                    <div className='grid grid-cols-1 gap-4 text-body-sm'>
                      <div className='flex items-start gap-2'>
                        <div className='w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <div className='w-2 h-2 bg-orange-500 animate-pulse rounded-full'></div>
                        </div>

                        <div>
                          <p className='text-gray-600 text-sm'>
                            Use your own MetaMask or Web3 wallet for full control. Your keys, your data — synced across devices.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='h-auto w-px bg-gray-200' />

                <div className='flex flex-1 flex-col'>
                  <button
                    onClick={handleGuestClick}
                    disabled={isLoading}
                    className='flex flex-col items-center gap-4 w-full md:flex-row bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl p-4 md:p-6 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm'>
                      {isLoadingGuest ? (
                        <div className='w-7'>
                          <LoaderCircle className='w-7 h-7 text-white animate-spin' />
                        </div>
                      ) : (
                        <Zap className='w-6 h-6 text-white animate-pulse' />
                      )}
                    </div>
                    <div className='text-center md:text-left'>
                      <div className='font-bold text-lg'>Burner Wallet</div>
                      <div className='text-white/90 text-sm'>
                        {isUsingBurnerWallet ? 'Continue as Guest' : 'No wallet needed — try instantly'}
                      </div>
                    </div>
                  </button>

                  <div className='py-4'>
                    <div className='grid grid-cols-1 gap-4 text-sm'>
                      <div className='flex items-start gap-2 mr-2'>
                        <div className='w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></div>
                        </div>

                        <div>
                          <p className='text-gray-600 text-sm'>
                            A temporary wallet is created in your browser — no extension or signup needed. Great for trying out Cipherdolls. Data is stored locally and lost if you clear your browser.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LoginModal;
