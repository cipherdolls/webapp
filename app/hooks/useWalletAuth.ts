import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ethers } from 'ethers';
import { apiUrl, ROUTES } from '~/constants';
import { useAuthStore } from '~/store/useAuthStore';
import { useAlert } from '~/providers/AlertDialogProvider';
import { burnerWalletManager } from '~/utils/burnerWallet';
import { clearQueryCache } from '~/utils/queryCache';

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
  signInAsGuest: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  hasEthereum: boolean;
}

export function useWalletAuth(): UseWalletAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasEthereum] = useState(typeof window !== 'undefined' && !!window.ethereum);
  const navigate = useNavigate();
  const { isAuthenticated, setToken, redirectAfterSignIn, setRedirectAfterSignIn, setReferralId, setUsingBurnerWallet, clearBurnerWallet, isUsingBurnerWallet } = useAuthStore();
  const alert = useAlert();

  // Helper functions for common logic
  const getAuthMessage = (address: string, nonce: string) => {
    const timestamp = new Date().toISOString();
    const url = new URL(window.location.href);
    const domain = url.hostname;
    
    return `
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
  };

  const handleSuccessfulAuth = async (token: string, isGuestSignIn: boolean = false) => {
    // Store token
    setToken(token);
    
    if (isGuestSignIn) {
      setUsingBurnerWallet(true);
    } else {
      // Clear burner wallet when switching to MetaMask
      clearBurnerWallet();
    }

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

    // Navigate with full page reload to ensure fresh data
    setTimeout(() => {
      const referral = new URLSearchParams(window.location.search).get('referral');
      if (redirectAfterSignIn) {
        const redirect = redirectAfterSignIn;
        setRedirectAfterSignIn(null);
        window.location.href = redirect;
      } else if (referral) {
        setReferralId(referral);
        window.location.href = ROUTES.chats;
      } else {
        window.location.href = ROUTES.chats;
      }
    }, 100);
  };

  const signIn = async () => {
    // If already authenticated but using burner wallet, allow switching to MetaMask
    if (isAuthenticated && !isUsingBurnerWallet) {
      navigate(ROUTES.chats);
      return;
    }

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

      // Create sign-in message
      const message = getAuthMessage(address, nonce);

      // Request signature with timeout
      let signedMessage;
      try {
        const signaturePromise = signer.signMessage(message);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Signature timeout')), 15000)
        );
        
        signedMessage = await Promise.race([signaturePromise, timeoutPromise]) as string;
      } catch (signError) {
        if (signError instanceof Error && signError.message === 'Signature timeout') {
          await showErrorAlert(alert, WALLET_AUTH_ERRORS.SIGNATURE_TIMEOUT, () => signIn());
          return;
        }
        throw signError;
      }

      // Send to backend
      const referral = new URLSearchParams(window.location.search).get('referral');
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

      await handleSuccessfulAuth(token, false);
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

  const signInAsGuest = async () => {
    // If already authenticated, navigate to chats
    if (isAuthenticated) {
      navigate(ROUTES.chats);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Get or create burner wallet
      const wallet = burnerWalletManager.getOrCreateWallet();
      console.log('🔑 Using burner wallet:', wallet.address);

      // Get nonce from backend
      const nonceRes = await fetch(`${apiUrl}/auth/nonce`);
      const { nonce } = await nonceRes.json();

      // Create sign-in message
      const message = getAuthMessage(wallet.address, nonce);

      // Sign message with burner wallet
      const signedMessage = await burnerWalletManager.signMessage(message);

      // Send to backend
      const referral = new URLSearchParams(window.location.search).get('referral');
      const signinRes = await fetch(
        referral ? `${apiUrl}/auth/signin?invitedBy=${referral}` : `${apiUrl}/auth/signin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signedMessage, message, address: wallet.address }),
        }
      );

      const signinData = await signinRes.json();
      const token = signinData?.token;

      if (!token) {
        throw new Error('No token returned from signin');
      }

      await handleSuccessfulAuth(token, true);
    } catch (err) {
      console.error('Guest sign-in error:', err);
      
      await alert({
        icon: '⚠️',
        title: 'Guest Sign-in Failed',
        body: `Failed to sign in as guest: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        actionButton: {
          label: 'Try Again',
          action: () => signInAsGuest()
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signInAsGuest,
    isLoading,
    error,
    hasEthereum,
  };
}