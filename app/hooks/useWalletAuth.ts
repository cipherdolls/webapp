import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ethers } from 'ethers';
import { apiUrl, ROUTES } from '~/constants';
import { useAuthStore } from '~/store/useAuthStore';
import { useAlert } from '~/providers/AlertDialogProvider';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Wallet auth error configurations
const WALLET_AUTH_ERRORS = {
  META_MASK_NOT_FOUND: {
    icon: '🦊',
    title: 'MetaMask Not Found',
    body: 'MetaMask extension not found. Please install MetaMask and refresh the page.',
    actionButton: {
      label: 'Refresh Page',
      action: () => window.location.reload()
    }
  },
  CONNECTION_REJECTED: {
    icon: '❌',
    title: 'Connection Rejected',
    body: 'MetaMask connection was rejected. Please try again and approve the connection in MetaMask.',
    actionButton: {
      label: 'Try Again',
      action: () => {} // Will be set dynamically
    }
  },
  SIGNATURE_TIMEOUT: {
    icon: '⏰',
    title: 'MetaMask Signature Timeout',
    body: 'MetaMask signature is taking too long. Please open MetaMask manually, enter your password, and try signing in again.',
    actionButton: {
      label: 'Try Again',
      action: () => {} // Will be set dynamically
    }
  },
  NO_ACCOUNTS_FOUND: {
    icon: '🔒',
    title: 'No Accounts Found',
    body: 'No MetaMask accounts found. Please unlock MetaMask and try again.',
    actionButton: {
      label: 'Try Again',
      action: () => {} // Will be set dynamically
    }
  },
  CONNECTION_FAILED: {
    icon: '⚠️',
    title: 'Connection Failed',
    body: 'MetaMask connection failed. Please make sure MetaMask is unlocked and try again.',
    actionButton: {
      label: 'Try Again',
      action: () => {} // Will be set dynamically
    }
  },
  UNKNOWN_ERROR: {
    icon: '❓',
    title: 'Unknown Error',
    body: 'An unknown error occurred. Please try again.',
    actionButton: {
      label: 'Try Again',
      action: () => {} // Will be set dynamically
    }
  }
} as const;

// Helper function to show error alerts
const showErrorAlert = async (alert: any, errorConfig: any, retryAction?: () => void) => {
  const config = { ...errorConfig };
  
  // Set the retry action if provided
  if (retryAction && config.actionButton) {
    config.actionButton = { ...config.actionButton, action: retryAction };
  }
  
  await alert(config);
};

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
  const alert = useAlert();

  const signIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Check for MetaMask
      if (!window.ethereum) {
        await showErrorAlert(alert, WALLET_AUTH_ERRORS.META_MASK_NOT_FOUND);
        return;
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

      // Request signature with timeout
      let signedMessage;
      try {
        const signaturePromise = signer.signMessage(message);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Signature timeout')), 15000)
        );
        
        signedMessage = await Promise.race([signaturePromise, timeoutPromise]);
      } catch (signError) {
        if (signError instanceof Error && signError.message === 'Signature timeout') {
          await showErrorAlert(alert, WALLET_AUTH_ERRORS.SIGNATURE_TIMEOUT, () => signIn());
          return;
        }
        throw signError;
      }

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
      console.error('Sign-in error:', err);
      
      // Handle specific error cases with user-friendly messages
      if (err instanceof Error) {
        if (err.message.includes('User rejected')) {
          await showErrorAlert(alert, WALLET_AUTH_ERRORS.CONNECTION_REJECTED, () => signIn());
        } else if (err.message.includes('MetaMask not found')) {
          await showErrorAlert(alert, WALLET_AUTH_ERRORS.META_MASK_NOT_FOUND);
        } else if (err.message.includes('Signature timeout')) {
          await showErrorAlert(alert, WALLET_AUTH_ERRORS.SIGNATURE_TIMEOUT, () => signIn());
        } else if (err.message.includes('No accounts found')) {
          await showErrorAlert(alert, WALLET_AUTH_ERRORS.NO_ACCOUNTS_FOUND, () => signIn());
        } else {
          // Custom error message for connection failed
          await alert({
            icon: '⚠️',
            title: 'Connection Failed',
            body: `MetaMask connection failed: ${err.message}. Please make sure MetaMask is unlocked and try again.`,
            actionButton: {
              label: 'Try Again',
              action: () => signIn()
            }
          });
        }
      } else {
        await showErrorAlert(alert, WALLET_AUTH_ERRORS.UNKNOWN_ERROR, () => signIn());
      }
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