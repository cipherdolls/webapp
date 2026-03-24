import { NETWORKS, REQUIRED_NETWORK_FOR_TOKEN_PERMITS } from '~/constants';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface NetworkSwitchResult {
  success: boolean;
  error?: string;
}

export async function getCurrentChainId(): Promise<string | null> {
  if (!window.ethereum) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error('Error getting current chain ID:', error);
    return null;
  }
}

export async function isOnCorrectNetworkForTokenPermits(): Promise<boolean> {
  const currentChainId = await getCurrentChainId();
  return currentChainId === REQUIRED_NETWORK_FOR_TOKEN_PERMITS.chainId;
}

export async function switchToBaseNetwork(): Promise<NetworkSwitchResult> {
  if (!window.ethereum) {
    return {
      success: false,
      error: 'MetaMask not detected. Please install MetaMask to switch networks.',
    };
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORKS.BASE.chainId }],
    });

    return { success: true };
  } catch (error: any) {
    if (error.code === 4902) {
      return await addBaseNetwork();
    }

    return {
      success: false,
      error: error.message || 'Failed to switch network',
    };
  }
}

async function addBaseNetwork(): Promise<NetworkSwitchResult> {
  if (!window.ethereum) {
    return {
      success: false,
      error: 'MetaMask not detected',
    };
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [NETWORKS.BASE],
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to add Base network',
    };
  }
}

export function listenForNetworkChanges(callback: (chainId: string) => void): (() => void) | null {
  if (!window.ethereum) {
    return null;
  }

  const handleChainChanged = (chainId: string) => {
    callback(chainId);
  };

  window.ethereum.on('chainChanged', handleChainChanged);

  return () => {
    if (window.ethereum) {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };
}
