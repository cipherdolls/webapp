import { Outlet, useRevalidator } from 'react-router';
import type { Chat, Message, ProcessEvent } from '~/types';
import type { Route } from './+types/_main.chats.$chatId';
import { useEffect, useRef, useState } from 'react';
import mqtt from 'mqtt';
import { Buffer } from 'buffer';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import ChatTopBar from '~/components/chat/ChatTopBar';
import ChatBottomBar from '~/components/chat/ChatBottomBar';
import ChatBody from '~/components/chat/ChatBody';
import { backendUrl } from '~/constants';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { chatId } = params;
  const [chatRes, messagesRes] = await Promise.all([fetchWithAuth(`chats/${chatId}`), fetchWithAuth(`messages?chatId=${chatId}`)]);
  if (!chatRes.ok || !messagesRes.ok) {
    throw new Error('Failed to fetch data');
  }
  const chat: Chat = await chatRes.json();
  const messages: Message[] = await messagesRes.json();
  return { chat, messages };
}

export default function ChatShow({ loaderData }: Route.ComponentProps) {
  const { chat, messages } = loaderData;
  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const localStorageToken = localStorage.getItem('token');
  const mqttHost = 'wss://mqtt.cipherdolls.com';
  const clientId = `frontend_${Math.random().toString(16).slice(3)}`;
  const revalidator = useRevalidator();
  const { playAudio } = useAudioPlayer();
  const [isGenerating, setIsGenerating] = useState(false);

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

      const userTopic = `chats/${chat.id}/processEvents`;
      mqttClient.subscribe(userTopic);

      const handleMessage = (topic: string, message: Buffer) => {
        const processEvent: ProcessEvent = JSON.parse(message.toString());
        if (processEvent.resourceName === 'Message') {
          // TODO: refactor it to use the better way to handle the audio playing
          revalidator.revalidate().then(() => {
            fetchWithAuth(`messages?chatId=${chat.id}`)
              .then((res) => res.json())
              .then((updatedMessages: Message[]) => {
                const latestMessage = updatedMessages[updatedMessages.length - 1];
                if (latestMessage.role === 'ASSISTANT' && latestMessage.fileName) {
                  const audio = new Audio(`${backendUrl}/messages/${latestMessage.id}/audio`);
                  playAudio(audio);
                }
              });
          });
        }
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
  }, [chat.id]);

  return (
    <>
      <div className='fixed inset-0 lg:static bg-main-gradient lg:bg-transparent flex-1 flex flex-col shadow-top overflow-hidden md:rounded-xl'>
        {/* chat header */}
        <ChatTopBar chat={chat} />

        {/* chat messages scroll */}
        <ChatBody messages={messages} isGenerating={isGenerating} />

        {/* chat input field  */}
        <ChatBottomBar chat={chat} isGenerating={isGenerating} />
      </div>
      <Outlet />
    </>
  );
}
