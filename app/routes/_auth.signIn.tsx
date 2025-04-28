import { ethers } from 'ethers';
import { useLocalStorage } from 'usehooks-ts';
import { useEffect, useState } from 'react';
import SignInWithMetamask from '~/components/buttons/signInWithMetamask';
import HowItWorksModal from '~/components/howItWorksModal';
import SignInPatterns from '~/components/ui/signInPatterns';
import type { Route } from './+types/_auth.signIn';
import { useFetcher, useNavigate } from 'react-router';
import { apiUrl } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'SignIn' }];
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
  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.data?.token) {
      setToken(fetcher.data.token);
      navigate('/');
    }
    if (fetcher.data?.error) {
      console.error('Sign-in error:', fetcher.data.error);
    }
  }, [fetcher.data, token]);

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
      navigate('/');
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

  return (
    <>
      <div className='flex flex-col gap-20 mb-[88px] sm:mb-0 z-10'>
        <div className='flex flex-col sm:gap-8 gap-5 items-center justify-center'>
          <img src='/logo.svg' alt='Cipherdolls' className='sm:w-[234px] sm:h-8 w-[146px] h-5' width={234} height={32} />
          <h1 className='sm:text-heading-h0 text-heading-h2 text-base-black text-center'>Welcome Here!</h1>
        </div>
        <div className='flex flex-col gap-8 justify-center items-center sm:static absolute bottom-[2.125rem] left-1/2 -translate-x-1/2 sm:translate-x-0 w-full sm:w-auto'>
          <fetcher.Form method='post'>
            <SignInWithMetamask type='submit' />
          </fetcher.Form>

          <HowItWorksModal />
        </div>
      </div>
      <SignInPatterns />
    </>
  );
}
