import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ethers } from 'ethers';
import { apiUrl, ROUTES } from '~/constants';
import { useAuthStore } from '~/store/useAuthStore';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface UseWalletAuthReturn {
  signIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  hasEthereum: boolean;
}

export function useWalletAuth(): UseWalletAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasEthereum] = useState(typeof window !== 'undefined' && !!window.ethereum);
  const navigate = useNavigate();
  const { setToken, redirectAfterSignIn, setRedirectAfterSignIn, setReferralId } = useAuthStore();

  const signIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Check for MetaMask
      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask extension.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get nonce from backend
      const nonceRes = await fetch(`${apiUrl}/auth/nonce`);
      const { nonce } = await nonceRes.json();

      // Setup provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const timestamp = new Date().toISOString();
      const url = new URL(window.location.href);
      const domain = url.hostname;
      const params = new URLSearchParams(window.location.search);
      const referral = params.get('referral');

      // Create sign-in message
      const message = `
${domain} wants you to sign in with your Ethereum account:
${address}

By signing this message, you prove ownership of this wallet
and agree to our Terms of Service and Privacy Policy.

URI: ${url.origin}
Version: 1
Chain ID: 10
Nonce: ${nonce}
Issued At: ${timestamp}
      `.trim();

      // Request signature
      const signedMessage = await signer.signMessage(message);

      // Send to backend
      const signinRes = await fetch(
        referral ? `${apiUrl}/auth/signin?invitedBy=${referral}` : `${apiUrl}/auth/signin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signedMessage, message, address }),
        }
      );

      const signinData = await signinRes.json();
      const token = signinData?.token;

      if (!token) {
        throw new Error('No token returned from signin');
      }

      // Store token
      setToken(token);

      // Verify token
      const verifyRes = await fetch(`${apiUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!verifyRes.ok) {
        throw new Error('Token verification failed');
      }

      // Handle navigation
      if (redirectAfterSignIn) {
        const redirect = redirectAfterSignIn;
        setRedirectAfterSignIn(null);
        navigate(redirect);
      } else if (referral) {
        setReferralId(referral);
        navigate(ROUTES.chats, { replace: true });
      } else {
        navigate(ROUTES.chats, { replace: true });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Sign-in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
    error,
    hasEthereum,
  };
}