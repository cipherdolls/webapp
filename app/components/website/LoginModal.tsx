import { useLoginModal } from '~/context/login-modal-context';
import { useWalletAuth } from '~/hooks/useWalletAuth';
import { useAuthStore } from '~/store/useAuthStore';
import * as Dialog from '@radix-ui/react-dialog';
import { Zap, X, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn, cnExt } from '~/utils/cn';
import { ROUTES } from '~/constants';
import { useNavigate } from 'react-router';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const LoginModal = () => {
  const [isLoadingMetamask, setIsLoadingMetamask] = useState(false);
  const [isLoadingGuest, setIsLoadingGuest] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { isOpen, close } = useLoginModal();
  const { verifyToken } = useAuthStore();
  const { signIn, signInAsGuest, isLoading, error, hasEthereum } = useWalletAuth();
  const navigate = useNavigate();

  const handleMetaMaskClick = async () => {
    if (!hasEthereum) {
      return;
    }

    setIsLoadingMetamask(true);
    try {
      setIsConfirmOpen(true)
      await signIn();
    } catch (error) {
      console.error('Sign in with MetaMask failed:', error);
    } finally {
      setIsConfirmOpen(false)
      setIsLoadingMetamask(false);
    }
  };

  const handleGuestClick = async () => {
    setIsLoadingGuest(true);
    try {
      await signInAsGuest();
    } catch (error) {
      console.error('Sign in as guest failed:', error);
    } finally {
      setIsLoadingGuest(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsVerifying(false);
      return;
    }

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

        <Dialog.Content className={cn('fixed inset-0 sm:left-[50%] sm:top-[50%] z-50 sm:translate-x-[-50%] sm:translate-y-[-50%] bg-white rounded-none sm:rounded-3xl shadow-2xl max-w-full sm:max-w-lg w-full h-full sm:h-fit sm:max-h-[calc(100vh-150px)] sm:overflow-y-auto animate-modal-fade overflow-y-auto', isConfirmOpen && 'blur-xs')}>
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
          ) : (
            <div className='flex flex-col px-6 py-10 sm:px-8 sm:py-8 w-full'>
              {/* Close Button */}
              <Dialog.Close asChild>
                <button className='absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110'>
                  <X className='w-5 h-5 text-gray-600' />
                </button>
              </Dialog.Close>

              {/* Header */}
              <div className='text-center mb-8'>
                <div className='inline-flex items-center justify-center py-5'>
                  <img src='/logo.svg' alt='Cipherdolls' className='w-48 h-auto' />
                </div>
                <p className='text-gray-600 text-base leading-relaxed'>
                  Choose how you'd like to get started. Connect with MetaMask for a personalized experience, or jump right in with Guest
                  Mode.
                </p>
              </div>

              {/* Login Options */}
              <div className='space-y-4 mb-6'>
                {/* MetaMask Login */}
                <button
                  onClick={handleMetaMaskClick}
                  disabled={isLoading || !hasEthereum}
                  className={cnExt(
                    'flex items-center gap-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-6 transition-all duration-300 relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed',
                    isLoadingMetamask ? 'disabled:opacity-80' : '',
                    !hasEthereum ? 'disabled:opacity-30' : ''
                  )}
                >
                  <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center'>
                    <img src='/metamask.svg' alt='MetaMask' className='w-8 h-8' />
                  </div>
                  <div className='text-left'>
                    <div className='font-bold text-lg'>Login with MetaMask</div>
                    <div className='text-white/90 text-sm'>Secure Web3 authentication</div>
                  </div>
                  <div className='ml-auto w-7'>{isLoadingMetamask ? <LoaderCircle className='w-7 h-7 text-white animate-spin' /> : null}</div>
                </button>

                {!hasEthereum ? (
                  <div className='text-sm text-black/80 text-left space-y-1 rounded-2xl bg-white/80 border border-orange-200 px-4 py-3 shadow-sm'>
                    <p>
                      MetaMask extension not detected. Please install or enable it to continue. Alternatively, you can use a Web3-enabled
                      browser like{' '}
                      <a href='https://brave.com/' target='_blank' rel='noopener noreferrer' className='underline font-medium'>
                        Brave
                      </a>{' '}
                      or{' '}
                      <a href='https://status.im/' target='_blank' rel='noopener noreferrer' className='underline font-medium'>
                        Status
                      </a>{' '}
                      for built-in wallet support.{' '}
                      <a href='https://metamask.io/download/' target='_blank' rel='noopener noreferrer' className='underline font-medium'>
                        Download MetaMask
                      </a>
                    </p>
                  </div>
                ) : null}

                {/* Guest Mode */}
                <button
                  onClick={handleGuestClick}
                  disabled={isLoading}
                  className='flex items-center gap-4 justify-between w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl p-6 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm'>
                    <Zap className='w-6 h-6 text-white animate-pulse' />
                  </div>
                  <div className='text-left'>
                    <div className='font-bold text-lg'>Guest Mode</div>
                    <div className='text-white/90 text-sm'>Start chatting instantly</div>
                  </div>
                  <div className='ml-auto w-7'>{isLoadingGuest ? <LoaderCircle className='w-7 h-7 text-white animate-spin' /> : null}</div>
                </button>
              </div>

              {/* Features */}
              <div className='border-t border-gray-200 pt-6 pb-6'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='flex items-start gap-2'>
                    <div className='w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                    </div>
                    <div>
                      <div className='font-semibold text-gray-900'>Anonymous</div>
                      <div className='text-gray-600 text-xs'>No signup required</div>
                    </div>
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='w-5 h-5 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <div className='w-2 h-2 bg-cyan-500 rounded-full'></div>
                    </div>
                    <div>
                      <div className='font-semibold text-gray-900'>Instant Access</div>
                      <div className='text-gray-600 text-xs'>Start chatting now</div>
                    </div>
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                    </div>
                    <div>
                      <div className='font-semibold text-gray-900'>Secure</div>
                      <div className='text-gray-600 text-xs'>Your data is safe</div>
                    </div>
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                    </div>
                    <div>
                      <div className='font-semibold text-gray-900'>AI Powered</div>
                      <div className='text-gray-600 text-xs'>Smart conversations</div>
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
