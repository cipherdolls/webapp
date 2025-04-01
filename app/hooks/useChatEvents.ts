import { useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { Buffer } from 'buffer';
import type { ActionEvent, Chat, ProcessEvent } from '~/types';

interface useChatEventsOptions {
  chat: Chat; // entire chat object
  onActionEvent?: (data: ActionEvent) => void;
  onProcessEvent?: (data: ProcessEvent) => void;
}

export function useChatEvents({ chat, onActionEvent, onProcessEvent }: useChatEventsOptions) {
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

      // Define topics
      const processEventsTopic = `chats/${chat.id}/processEvents`;
      const actionEventsTopic = `chats/${chat.id}/actionEvents`;

      // Subscribe conditionally based on provided callbacks
      if (onProcessEvent) {
        mqttClient.subscribe(processEventsTopic);
      }
      if (onActionEvent) {
        mqttClient.subscribe(actionEventsTopic);
      }

      const handleMessage = (topic: string, message: Buffer) => {
        const data = JSON.parse(message.toString());
        if (topic === processEventsTopic && onProcessEvent) onProcessEvent(data);
        if (topic === actionEventsTopic && onActionEvent) onActionEvent(data);
      };

      mqttClient.on('message', handleMessage);
      mqttClient.on('connect', () => {
        mqttClient.publish(`connections`, JSON.stringify({ clientId, deviceType: 'browser', status: 'connected' }), { qos: 1 });
      });

      return () => {
        if (onProcessEvent) {
          mqttClient.unsubscribe(processEventsTopic);
        }
        if (onActionEvent) {
          mqttClient.unsubscribe(actionEventsTopic);
        }
        mqttClient.off('message', handleMessage);
        mqttClient.end(); // Disconnect the client
        mqttClientRef.current = null;
      };
    }
    // eslint-disable-next-line
  }, [chat.id]);
}
