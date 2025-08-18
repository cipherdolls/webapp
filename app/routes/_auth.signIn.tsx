import { ethers } from 'ethers';
import { useLocalStorage } from 'usehooks-ts';
import { useEffect, useState } from 'react';
import HowItWorksModal from '~/components/howItWorksModal';
import SignInPatterns from '~/components/ui/signInPatterns';
import type { Route } from './+types/_auth.signIn';
import { useFetcher, useNavigate } from 'react-router';
import { apiUrl } from '~/constants';
import Mixedbread from '../assets/logos/mixedbread.png';
import Elevenlabs from '../assets/logos/elevenlabs.png';
import Groq from '../assets/logos/groq.png';
import Openrouter from '../assets/logos/openrouter.png';
import Assembly from '../assets/logos/assembly.png';
import * as Button from '~/components/ui/button/button';
import TermsOfServiceModal from '~/components/TermsOfServiceModal';
import PrivacyPolicy from '~/components/PrivacyPolicyModal';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Sign In' }];
}

declare global {
  interface Window {
    ethereum?: any; // or more specific type
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const nonceRes = await fetch(`${apiUrl}/auth/nonce`);
    const res = await nonceRes.json();
    const nonce = res.nonce;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const timestamp = new Date().toISOString();
    const url = new URL(request.url);
    const domain = url.hostname;

    const message = `
${domain} wants you to sign in with your Ethereum account:
${address}

By signing this message, you prove ownership of this wallet
and agree to our Terms of Service and Privacy Policy.

URI: ${url}
Version: 1
Chain ID: 10
Nonce: ${nonce}
Issued At: ${timestamp}
    `.trim();

    const signedMessage = await signer.signMessage(message);
    const signinRes = await fetch(`${apiUrl}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedMessage, message, address }),
    });

    const signinData = await signinRes.json();
    const token = signinData?.token;
    if (!token) {
      throw new Error('No token returned from signin');
    }
    return { token };
  } catch (error) {
    console.error('Error:', error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

export default function SignInRoute() {
  const fetcher = useFetcher();
  const [token, setToken] = useLocalStorage('token', undefined);
  const [connected, setConnected] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasEthereum, setHasEthereum] = useState(false);

  const handleSuccessfulAuth = () => {
    if (hasNavigated) return;

    setHasNavigated(true);
    const redirectUrl = localStorage.getItem('redirectAfterSignIn');
    if (redirectUrl) {
      localStorage.removeItem('redirectAfterSignIn');
      navigate(redirectUrl);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    if (fetcher.data?.token) {
      setToken(fetcher.data.token);
      handleSuccessfulAuth();
    }
    if (fetcher.data?.error) {
      console.error('Sign-in error:', fetcher.data.error);
    }
  }, [fetcher.data]);

  useEffect(() => {
    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('DEBUG: accountsChanged event:', accounts.length);
        if (accounts.length === 0) {
          setConnected(false);
        } else {
          setConnected(true);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  useEffect(() => {
    console.log('DEBUG: connected =', connected, 'token =', token ? 'exists' : 'undefined');
    if (connected === true && token !== undefined) {
      console.log('Connected and token is set - triggering redirect');
      handleSuccessfulAuth();
    }
    // eslint-disable-next-line
  }, [connected, token]);

  const checkConnection = async () => {
    try {
      if (!window.ethereum) {
        console.log('DEBUG: No ethereum object');
        setConnected(false);
        return;
      }

      // Use eth_accounts instead of provider.listAccounts()
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      console.log('DEBUG: Found accounts via eth_accounts:', accounts.length);

      if (accounts.length === 0) {
        setConnected(false);
      } else {
        setConnected(true);
      }
    } catch (error) {
      console.log('DEBUG: checkConnection error:', error);
      setConnected(false);
    }
  };

  const verifyToken = async () => {
    try {
      const localToken = localStorage.getItem('token')?.replaceAll('"', '');
      const res = await fetch(`${apiUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localToken}`,
        },
      });

      // If 200 => token is valid
      if (res.status === 200) {
        return true;
      }
      // If 401 => token invalid
      if (res.status === 401) {
        localStorage.removeItem('token');
        return false;
      }
      // Otherwise, some other error
      return false;
    } catch (err) {
      console.error('Verify token error:', err);
      return false;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasEthereum(typeof window !== 'undefined' && !!window.ethereum);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className='flex flex-col justify-between py-16 flex-1 gap-[76px] h-screen overflow-y-auto z-40'>
        <div className='flex justify-center relative z-10'>
          <div className='flex flex-col sm:gap-8 gap-5 items-center justify-center'>
            <img src='/logo.svg' alt='Cipherdolls' className='sm:w-[234px] sm:h-8 w-[146px] h-5' width={234} height={32} />
            <div className='mx-2 flex flex-col md:mx-auto md:flex-row'>
              <div className='order-2 rounded-b-xl w-full flex flex-col p-2 bg-white md:rounded-xl md:max-w-[600px] lg:max-w-[656px]'>
                <iframe
                  className='w-full rounded-xl aspect-video min-h-[180px] max-h-[360px]'
                  src='https://www.youtube.com/embed/cb8CiwBFe30?si=P5FBgiPZPjj3oFYy'
                  title='YouTube video player'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                  allowFullScreen
                />

                <div className='px-4 py-6 flex flex-col gap-8 lg:py-10 lg:px-8 md:px-6 md:py-8'>
                  <p className='text-black text-body-md md:text-body-lg'>
                    A connected crypto wallet in your browser is required to log in (new or empty wallets are fine).
                  </p>
                  <div className='flex flex-col gap-4'>
                    {!isLoading && !hasEthereum ? (
                      <div className='p-5 bg-neutral-05 rounded-xl flex flex-col gap-4'>
                        <div className='flex gap-4'>
                          <span className='text-heading-h2'>⛔</span>
                          <p className='text-body-sm md:text-body-md text-neutral-01'>
                            Your browser isn't supported. Use a Web3 browser (e.g.,{' '}
                            <a
                              href='https://brave.com/download/'
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-block font-medium underline hover:text-black/70'
                            >
                              Brave
                            </a>
                            ,{' '}
                            <a
                              href='https://www.opera.com/features/opera-wallet'
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-block font-medium underline hover:text-black/70 mr-2'
                            >
                              Opera Crypto)
                            </a>
                            or{' '}
                            <a
                              href='https://metamask.io/download/'
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-block font-medium underline hover:text-black/70 mr-2'
                            >
                              MetaMask extension
                            </a>{' '}
                            for Chrome/Firefox.
                          </p>
                        </div>
                        <Button.Root size='lg' disabled={isLoading || !hasEthereum}>
                          Sign In
                        </Button.Root>
                      </div>
                    ) : (
                      <fetcher.Form method='post' className='w-full'>
                        <Button.Root disabled={isLoading || !hasEthereum} size='lg' type='submit' className='w-full'>
                          Sign In
                        </Button.Root>
                      </fetcher.Form>
                    )}

                    <div className='flex flex-wrap justify-center gap-6'>
                      <HowItWorksModal />
                      <TermsOfServiceModal />
                      <PrivacyPolicy />
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-4 order-first flex justify-center items-end gap-1 md:gap-2 md:order-last md:flex-col md:justify-start'>
                <div className='bg-gradient-1 h-max rounded-t-xl w-1/2 flex flex-col gap-2 items-center justify-center py-4 px-5 md:h-32 md:rounded-t-none md:rounded-r-xl md:w-[136px]'>
                  <div className='flex items-center gap-2 md:flex-col'>
                    <h3 className='text-lg md:text-heading-h3'>🎉</h3>
                    <h3 className='text-lg font-semibold text-base-black md:text-heading-h3'>Free</h3>
                  </div>

                  <span className='text-body-sm text-center text-neutral-01'>Registration and usage</span>
                </div>
                <div className='bg-gradient-1 h-max rounded-t-xl w-1/2 flex flex-col gap-2 items-center justify-center py-4 px-5 md:rounded-t-none md:h-32 md:rounded-r-xl md:w-[136px]'>
                  <div className='flex items-center gap-2 md:flex-col'>
                    <h3 className='text-lg md:text-heading-h3'>💶</h3>
                    <h3 className='text-lg md:text-heading-h3 font-semibold text-base-black'>1 LOV</h3>
                  </div>

                  <span className='text-body-sm text-center text-neutral-01'>For monthly usage</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='relative z-10'>
          <div className='flex justify-start gap-6 px-5 items-center mx-auto max-w-3xl md:max-w-max overflow-y-auto pb-2.5 md:justify-between lg:gap-20 lg:px-0'>
            <img src={Mixedbread} alt='Mixedbread' draggable={'false'} className='object-cover select-none' />
            <img src={Openrouter} alt='Openrouter' draggable={'false'} className='object-cover select-none' />
            <img src={Groq} alt='Groq' draggable={'false'} className='object-cover select-none' />
            <img src={Elevenlabs} alt='Elevenlabs' draggable={'false'} className='object-cover select-none' />
            <img src={Assembly} alt='Assembly' draggable={'false'} className='object-cover select-none' />
          </div>
        </div>
      </div>
      <SignInPatterns />
    </>
  );
}
