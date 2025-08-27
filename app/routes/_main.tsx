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
import UserEventsToast from '~/components/UserEventsToast';
import { useUser } from '~/hooks/queries/userQueries';

export async function clientLoader() {
  const res = await fetchWithAuth(`users/me`);
  return await res.json();
}

const MainLayout = ({ loaderData }: Route.ComponentProps) => {
  const me: User = loaderData;
  const [provider, setProvider] = useState<ethers.BrowserProvider | undefined>(undefined);
  const [network, setNetwork] = useState<ethers.Network | undefined>(undefined);
  const navigate = useNavigate();

  useUser({
    initialData: loaderData?.user,
  });

  // Initialize provider
  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        try {
          // Request user accounts
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          // Create a new provider instance
          const providerInstance = new ethers.BrowserProvider(window.ethereum, 'any');
          const network = await providerInstance.getNetwork();
          setProvider(providerInstance);
          setNetwork(network);
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
        localStorage.removeItem('token');
        navigate(ROUTES.account);
      };

      // Subscribe to accountsChanged event directly from window.ethereum
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Cleanup listener when component unmounts
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [provider]);

  return (
    <MainLayoutProviders>
      <div className='flex sm:flex-row flex-col-reverse size-full h-screen'>
        <Sidebar />
        <Outlet />
      </div>
      <UserEventsToast user={me} />
    </MainLayoutProviders>
  );
};

export default MainLayout;

// PROVIDERS WRAPPER

export const MainLayoutProviders = ({ children }: { children: React.ReactNode }) => {
  const localStorageToken = localStorage.getItem('token');
  const mqttConfig = useMemo(() => {
    const clientId = `frontend_${Math.random().toString(16).slice(3)}`;

    return {
      brokerUrl: wsURL,
      options: {
        clientId,
        username: 'frontend',
        password: localStorageToken?.replaceAll('"', ''),
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
  }, [localStorageToken]);

  return (
    <MqttProvider config={mqttConfig}>
      <AudioPlayerProvider>{children}</AudioPlayerProvider>
    </MqttProvider>
  );
};
