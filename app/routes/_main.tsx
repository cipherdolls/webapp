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

export async function clientLoader() {
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const headers = {
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
  };
  try {
    const res = await fetch(`${backendUrl}/users/me`, headers);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}

const MainLayout = ({ loaderData }: Route.ComponentProps) => {
  const me: User = loaderData;
  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const localStorageToken = localStorage.getItem('token');
  const mqttHost = 'wss://mqtt.cipherdolls.com';
  const clientId = `frontend_${Math.random().toString(16).slice(3)}`;
  const [provider, setProvider] = useState<ethers.BrowserProvider | undefined>(undefined);
  const [network, setNetwork] = useState<ethers.Network | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mqttClientRef.current) {
      const mqttClient = mqtt.connect(mqttHost, {
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
        console.log(processEvent);
        // Handle the event
      };

      mqttClient.on('message', handleMessage);
      mqttClient.on('connect', () => {
        mqttClient.publish(`connections`, JSON.stringify({ clientId, deviceType: 'browser', status: 'connected' }), { qos: 1 });
      });

      // Clean up the subscription and event listener on unmount
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
        navigate("/");
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
