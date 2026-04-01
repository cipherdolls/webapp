import { Outlet, useNavigate } from 'react-router';
import Sidebar from '~/components/sidebar';
import type { Route } from './+types/_main';
import type { User } from '~/types';
import { useEffect, useMemo, useState } from 'react';
import { Buffer } from 'buffer';
import { AudioPlayerProvider } from 'react-use-audio-player';
import { ethers } from 'ethers';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { ROUTES, wsURL } from '~/constants';
import { MqttProvider } from '~/providers/MqttContext';
import GlobalSubscriber from '~/mqtt/GlobalSubscriber';
import { useAuthStore } from '~/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { GuestModeBanner } from '~/components/GuestModeBanner';

export async function clientLoader() {
  const res = await fetchWithAuth(`users/me`);
  return await res.json();
}

const MainLayout = ({ loaderData }: Route.ComponentProps) => {
  const me: User = loaderData;
  const [provider, setProvider] = useState<ethers.BrowserProvider | undefined>(undefined);
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  // Initialize provider
  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        try {
          // Request user accounts
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          // Create a new provider instance
          const providerInstance = new ethers.BrowserProvider(window.ethereum, 'any');
          setProvider(providerInstance);
        } catch (error) {
          console.error('Error connecting to wallet:', error);
        }
      } else {
        console.error('Ethereum provider not found');
      }
    };

    initializeProvider();
  }, []);

  // Track network changes
  useEffect(() => {
    if (provider) {
      const handleChainChanged = (chainId: string) => {
        console.log('Chain changed:', chainId);
        window.location.reload();
      };

      // Subscribe to chainChanged event directly from window.ethereum
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup listener when component unmounts
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider]);

  // track account changes
  useEffect(() => {
    if (provider) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        // Clear all React Query cache when account changes
        queryClient.clear();
        clearAuth();
        navigate(ROUTES.index);
      };

      // Subscribe to accountsChanged event directly from window.ethereum
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Cleanup listener when component unmounts
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [provider, queryClient, clearAuth, navigate]);

  return (
    <MainLayoutProviders>
      <div className='flex flex-col size-full h-screen'>
        <GuestModeBanner />
        <div className='flex sm:flex-row flex-col-reverse flex-1 overflow-hidden'>
          <Sidebar />
          <Outlet />
        </div>
      </div>
      <GlobalSubscriber userId={me.id} />
    </MainLayoutProviders>
  );
};

export default MainLayout;

// PROVIDERS WRAPPER

export const MainLayoutProviders = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  const mqttConfig = useMemo(() => {
    const clientId = `frontend_${Math.random().toString(16).slice(3)}`;

    return {
      brokerUrl: wsURL,
      options: {
        clientId,
        username: 'frontend',
        password: token?.replaceAll('"', ''),
        keepAlive: 60,
        reconnectPeriod: 1000,
        connectTimeout: 30000,
        clean: true,
        will: {
          topic: 'connections',
          payload: Buffer.from(
            JSON.stringify({
              clientId,
              deviceType: 'browser',
              status: 'disconnected',
            })
          ),
          qos: 1 as const,
          retain: false,
        },
      },
    };
  }, [token]);

  return (
    <MqttProvider config={mqttConfig}>
      <AudioPlayerProvider>{children}</AudioPlayerProvider>
    </MqttProvider>
  );
};
