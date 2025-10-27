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
    body: 'You rejected the request in MetaMask. To sign in, please approve the connection and sign the message when MetaMask asks.',
    actionButton: {
      label: 'Try Again',
      action: () => {} // Will be set dynamically
    }
  },
  SIGNATURE_TIMEOUT: {
    icon: '⏰',
    title: 'Waiting for MetaMask',
    body: 'Please check your MetaMask extension. You may need to unlock it or approve the signature request. The MetaMask popup might be hidden behind other windows.',
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
      if (!window.ethereum) {
        setIsLoading(false);
        await showErrorAlert(alert, WALLET_AUTH_ERRORS.META_MASK_NOT_FOUND);
        return;
      }

      let accounts;
      try {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (!accounts || accounts.length === 0) {
          setIsLoading(false);
          await showErrorAlert(alert, WALLET_AUTH_ERRORS.NO_ACCOUNTS_FOUND, () => signIn());
          return;
        }
      } catch (accountError: any) {
        const errorMessage = accountError?.message?.toLowerCase() || '';
        const errorCode = accountError?.code;

        if (
          errorCode === 4001 ||
          errorMessage.includes('user rejected') ||
          errorMessage.includes('user denied') ||
          errorMessage.includes('user cancelled')
        ) {
          setIsLoading(false);
          await showErrorAlert(alert, WALLET_AUTH_ERRORS.CONNECTION_REJECTED, () => signIn());
          return;
        }

        console.error('MetaMask permission error:', accountError);
        setIsLoading(false);
        await showErrorAlert(alert, WALLET_AUTH_ERRORS.CONNECTION_FAILED, () => signIn());
        return;
      }

      const nonceRes = await fetch(`${apiUrl}/auth/nonce`);
      const { nonce } = await nonceRes.json();

      // Setup provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Create sign-in message
      const message = getAuthMessage(address, nonce);

      let signedMessage;
      try {
        const messageHex = ethers.hexlify(ethers.toUtf8Bytes(message));

        const signaturePromise = window.ethereum.request({
          method: 'personal_sign',
          params: [messageHex, address],
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Signature timeout')), 60000)
        );
        
        signedMessage = await Promise.race([signaturePromise, timeoutPromise]) as string;
      } catch (signError: any) {
        const errorMessage = signError?.message?.toLowerCase() || '';
        const errorCode = signError?.code;
        if (signError instanceof Error && signError.message === 'Signature timeout') {
          setIsLoading(false);
          await showErrorAlert(alert, WALLET_AUTH_ERRORS.SIGNATURE_TIMEOUT, () => signIn());
          return;
        }

        if (
          errorCode === 4001 ||
          errorMessage.includes('user rejected') ||
          errorMessage.includes('user denied') ||
          errorMessage.includes('user cancelled')
        ) {
          setIsLoading(false);
          await showErrorAlert(alert, WALLET_AUTH_ERRORS.CONNECTION_REJECTED, () => signIn());
          return;
        }

        console.error('Signature error:', signError);
        setIsLoading(false);
        await showErrorAlert(alert, WALLET_AUTH_ERRORS.CONNECTION_FAILED, () => signIn());
        return;
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
      setIsLoading(false);

      await alert({
        icon: '⚠️',
        title: 'Connection Failed',
        body: 'An unexpected error occurred during sign-in. Please try again.',
        actionButton: {
          label: 'Try Again',
          action: () => signIn()
        }
      });
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