import { Outlet, redirect } from 'react-router';
import mqtt from 'mqtt';
import Sidebar from '~/components/sidebar';
import type { Route } from './+types/_main';
import type { ProcessEvent, User } from '~/types';
import { useEffect, useRef } from 'react';
import { Buffer } from 'buffer';
import { AudioPlayerProvider } from '~/providers/AudioPlayerContext';
import useLayoutType from '~/hooks/useLayoutType';
import { cn } from '~/utils/cn';

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
  const layoutType = useLayoutType();
  const me: User = loaderData;
  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const localStorageToken = localStorage.getItem('token');
  const mqttHost = 'wss://mqtt.cipherdolls.com';
  const clientId = `frontend_${Math.random().toString(16).slice(3)}`;

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

  const isChatLayout = layoutType === 'chat';

  return (
    <AudioPlayerProvider>
      <div className='flex sm:flex-row flex-col-reverse size-full'>
        <Sidebar className={cn(isChatLayout && 'border-none')} />
        {isChatLayout ? (
          <>
            <main className='flex flex-1 sm:py-2 sm:pr-2'>
              <div className='flex flex-1 sm:rounded-xl sm:bg-linear-[86deg] sm:from-[rgba(254,253,248,0.56)]  sm:to-[rgba(255,255,255,0.56)]'>
                <Outlet />
              </div>
            </main>
          </>
        ) : (
          <>
            <main className='flex flex-1 overflow-y-scroll scrollbar-medium'>
              <div className='flex flex-1 max-w-[980px] w-full mx-auto py-3 sm:py-[22px] lg:px-8 md:px-6 sm:px-4 px-1.5'>
                <Outlet />
              </div>
            </main>
          </>
        )}
      </div>
    </AudioPlayerProvider>
  );
};

export default MainLayout;
