import { useEffect, useState } from 'react';
import { getCurrentChainId, isOnCorrectNetworkForTokenPermits, listenForNetworkChanges } from '~/utils/networkUtils';

export interface NetworkState {
  currentChainId: string | null;
  isOnCorrectNetwork: boolean;
  isLoading: boolean;
  hasMetaMask: boolean;
}

export function useNetworkCheck() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    currentChainId: null,
    isOnCorrectNetwork: false,
    isLoading: true,
    hasMetaMask: false,
  });

  const checkNetwork = async () => {
    if (!window.ethereum) {
      setNetworkState({
        currentChainId: null,
        isOnCorrectNetwork: false,
        isLoading: false,
        hasMetaMask: false,
      });
      return;
    }

    try {
      const chainId = await getCurrentChainId();
      const isCorrect = await isOnCorrectNetworkForTokenPermits();

      setNetworkState({
        currentChainId: chainId,
        isOnCorrectNetwork: isCorrect,
        isLoading: false,
        hasMetaMask: true,
      });
    } catch (error) {
      console.error('Error checking network:', error);
      setNetworkState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  useEffect(() => {
    checkNetwork();

    const cleanup = listenForNetworkChanges((chainId: string) => {
      setNetworkState(prev => ({
        ...prev,
        currentChainId: chainId,
        isOnCorrectNetwork: chainId === '0xa', // Optimism chain ID
      }));
    });

    return cleanup || undefined;
  }, []);

  const refetchNetwork = () => {
    setNetworkState(prev => ({ ...prev, isLoading: true }));
    checkNetwork();
  };

  return {
    ...networkState,
    refetchNetwork,
  };
}