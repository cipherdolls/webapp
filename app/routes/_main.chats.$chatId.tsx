import { Form, Link, Outlet, redirect, useFetcher } from "react-router";
import type { Chat, Message, ProcessEvent } from "~/types";
import ChatDestroy from "./chats.$id.destroy";
import type { Route } from "./+types/_main.chats.$chatId";
import { useEffect, useRef } from "react";
import mqtt from 'mqtt';
import { Buffer } from 'buffer';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chats" },
  ];
}

export async function clientLoader({params}: Route.LoaderArgs) {
  const chatId = params.chatId;
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
    const [chatRes, messagesRes] = await Promise.all([
      fetch(`${backendUrl}/chats/${chatId}`, headers),
      fetch(`${backendUrl}/messages?chatId=${chatId}`, headers),
    ]);
    if (!chatRes.ok || !messagesRes.ok) {
      throw new Error("Failed to fetch data");
    }
    const chat: Chat = await chatRes.json();
    const messages: Message[] = await messagesRes.json();

    return { chat, messages };
  } catch (error) {
    return redirect('/signin');
  }
}




export default function ChatShow({ loaderData }: Route.ComponentProps) {
  const { chat, messages } = loaderData;
  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const localStorageToken = localStorage.getItem('token');
  const mqttHost = 'wss://mqtt.cipherdolls.com';
  const clientId = `frontend_${Math.random().toString(16).slice(3)}`;
  const fetcher = useFetcher();

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
  }, [chat.id]);





  return (
    
    <>
      <div className="">
        {chat.id}
        <Link to={`/chats/${chat.id}/edit`}>--------------Edit Chat</Link>
        <ChatDestroy />
        <div className="">
          {messages.map((message) => (
            <div key={message.id}>
              <Link to={`/chats/${chat.id}/messages/${message.id}`}>{message.content}</Link>
            </div>
          ))}
        </div>


        <fetcher.Form method='post' action="/messages/new" encType='multipart/form-data'>
          <input name='chatId' defaultValue={chat.id} hidden />
          <input name='content' id='content' placeholder='content' />
          <button type='submit'>Send Message</button>
        </fetcher.Form>



        <Outlet />
      </div>
    </>


  );
}
