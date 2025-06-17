import { ethers } from 'ethers';
import { useLocalStorage } from 'usehooks-ts';
import { useEffect, useState } from 'react';
import SignInWithMetamask from '~/components/buttons/signInWithMetamask';
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
    const message = `I am signing this message to prove my identity. Nonce: ${nonce}`;
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
  }, []);

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  useEffect(() => {
    if (connected === true && token !== undefined) {
      console.log('Connected and token is set');
      handleSuccessfulAuth();
    }
    // eslint-disable-next-line
  }, [connected, token]);

  const checkConnection = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      setConnected(false);
    } else {
      setConnected(true);
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
      <div className='flex flex-col justify-between py-16 flex-1 gap-[76px] h-screen overflow-y-auto z-50'>
        <div className='flex justify-center relative z-10'>
          <div className='flex flex-col sm:gap-8 gap-5 items-center justify-center'>
            <img src='/logo.svg' alt='Cipherdolls' className='sm:w-[234px] sm:h-8 w-[146px] h-5' width={234} height={32} />
            <div className='flex md:flex-row flex-col'>
              <div className='lg:max-w-[656px] max-w-[600px] w-full flex flex-col p-2 bg-white rounded-xl'>
                <iframe
                  className='lg:h-[360px] md:h-[220px] h-[150px] w-full rounded-xl'
                  src='https://www.youtube.com/embed/cb8CiwBFe30?si=P5FBgiPZPjj3oFYy'
                  title='YouTube video player'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                  allowFullScreen
                ></iframe>
                <div className='lg:py-10 lg:px-8 md:px-6 md:py-8 px-4 py-6 flex flex-col gap-8'>
                  <p className='text-body-lg text-black'>
                    A connected crypto wallet in your browser is required to log in (new or empty wallets are fine)
                  </p>
                  <div className='flex flex-col gap-4'>
                    {!isLoading && !hasEthereum ? (
                      <div className='p-5 bg-neutral-05 rounded-xl flex flex-col gap-4'>
                        <div className='flex gap-4'>
                          <span className='text-heading-h2'>⛔</span>
                          <p className='text-body-md text-neutral-01'>
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
                    <HowItWorksModal />
                  </div>
                </div>
              </div>
              <div className='mt-4 flex md:flex-col justify-center md:justify-start gap-2 -ml-2'>
                <div className='bg-gradient-1 rounded-xl md:rounded-r-none w-[136px] h-32 flex flex-col gap-2 items-center justify-center py-4 px-5'>
                  <h3 className='text-heading-h3'>🎉</h3>
                  <h3 className='text-heading-h3 font-semibold text-base-black'>Free</h3>
                  <span className='text-body-sm text-center text-neutral-01'>Registration and usage</span>
                </div>
                <div className='bg-gradient-1 rounded-xl md:rounded-r-none w-[136px] h-32 flex flex-col gap-2 items-center justify-center py-4 px-5'>
                  <h3 className='text-heading-h3'>💶</h3>
                  <h3 className='text-heading-h3 font-semibold text-base-black'>Get €3</h3>
                  <span className='text-body-sm text-center text-neutral-01'>For monthly usage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='relative z-10'>
          <div className='flex lg:gap-20 w-full lg:max-w-max mx-auto md:justify-between justify-center lg:px-0 px-8 items-center md:flex-nowrap flex-wrap gap-6'>
            <img src={Mixedbread} alt='Mixedbread' className='object-cover' />
            <img src={Openrouter} alt='Openrouter' className='object-cover' />
            <img src={Groq} alt='Groq' className='object-cover' />
            <img src={Elevenlabs} alt='Elevenlabs' className='object-cover' />
            <img src={Assembly} alt='Assembly' className='object-cover' />
          </div>
        </div>
      </div>
      <SignInPatterns />
    </>
  );
}
