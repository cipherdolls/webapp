import { Form, Link, Outlet, redirect } from "react-router";
import type { Chat, Doll, Message, ProcessEvent } from "~/types";
import { useEffect, useRef } from "react";
import mqtt from 'mqtt';
import { Buffer } from 'buffer';
import type { Route } from "./+types/_main._general.dolls.$id";
import { fetchWithAuth } from "~/utils/fetchWithAuth";
import { wsURL } from "~/constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chats" },
  ];
}

export async function clientLoader({params}: Route.LoaderArgs) {
  const dollId = params.doll;
  const res = await fetchWithAuth(`dolls/${dollId}`);
  return await res.json();
}


export default function ChatShow({ loaderData }: Route.ComponentProps) {
  const doll: Doll = loaderData;
  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const localStorageToken = localStorage.getItem('token');
  const clientId = `frontend_${Math.random().toString(16).slice(3)}`;

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

      const userTopic = `dolls/${doll.id}/processEvents`;
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
  }, [doll.id]);





  return (
    <>
      <div className="">
        {doll.id}
        <Link to={`/dolls/${doll.id}/edit`}>--------------Edit Doll</Link>
      </div>
    </>


  );
}
