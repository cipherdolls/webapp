import { Outlet, redirect, useNavigate } from 'react-router';
import mqtt from 'mqtt';
import Sidebar from '~/components/sidebar';
import type { Route } from './+types/_main';
import type { ProcessEvent, User } from '~/types';
import { useEffect, useRef, useState } from 'react';
import { Buffer } from 'buffer';
import { AudioPlayerProvider } from '~/providers/AudioPlayerContext';
import { cn } from '~/utils/cn';
import { ethers } from 'ethers';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { showToast } from '~/components/ui/toast';
import { wsURL } from '~/constants';

export async function clientLoader() {
  const res = await fetchWithAuth(`users/me`);
  return await res.json();
}

const MainLayout = ({ loaderData }: Route.ComponentProps) => {
  const me: User = loaderData;
  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const localStorageToken = localStorage.getItem('token');
  const clientId = `frontend_${Math.random().toString(16).slice(3)}`;
  const [provider, setProvider] = useState<ethers.BrowserProvider | undefined>(undefined);
  const [network, setNetwork] = useState<ethers.Network | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mqttClientRef.current) {
      const mqttClient = mqtt.connect(wsURL, {
        clientId,
        username: 'frontend',
        password: localStorageToken?.replaceAll('"', ''),
        will: {
          topic: `connections`,
          payload: Buffer.from(JSON.stringify({ clientId, deviceType: 'browser', status: 'disconnected' })), // Convert string to Buffer
          qos: 1,
          retain: false,
        },
      });
      mqttClientRef.current = mqttClient;

      const userTopic = `users/${me.id}/processEvents`;
      mqttClient.subscribe(userTopic);

      const handleMessage = (topic: string, message: Buffer) => {
        const processEvent: ProcessEvent = JSON.parse(message.toString());

        const { resourceName, resourceId, jobName, jobStatus } = processEvent;

        let emoji = '⏳';
        let duration = 5000;
        let actionLink;

        if (jobStatus === 'completed') {
          emoji = '✅';
          duration = 5000;
        } else if (jobStatus === 'failed') {
          emoji = '❌';
          duration = 8000;

          switch (resourceName) {
            case 'Avatar':
              actionLink = `/avatars/${resourceId}`;
              break;
            case 'Chat':
              actionLink = `/chats/${resourceId}`;
              break;

            default:
              break;
          }
        }

        const formattedResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
        const formattedJobName = jobName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

        showToast({
          emoji,
          title: `${formattedResourceName} ${formattedJobName}`,
          description: `${jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)} (ID: ${resourceId})`,
          actionLink,
          actionText: actionLink ? 'View' : undefined,
          duration,
        });
      };

      mqttClient.on('message', handleMessage);
      mqttClient.on('connect', () => {
        mqttClient.publish(`connections`, JSON.stringify({ clientId, deviceType: 'browser', status: 'connected' }), { qos: 1 });
      });

      return () => {
        mqttClient.unsubscribe(userTopic);
        mqttClient.off('message', handleMessage);
        mqttClient.end(); // Disconnect the client
        mqttClientRef.current = null;
      };
    }
    // eslint-disable-next-line
  }, [me.id]);

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
        navigate('/');
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
    <AudioPlayerProvider>
      <div className='flex sm:flex-row flex-col-reverse size-full'>
        <Sidebar />
        <Outlet />
      </div>
    </AudioPlayerProvider>
  );
};

export default MainLayout;
