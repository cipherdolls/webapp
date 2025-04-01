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
  const mqttHost = 'wss://mqtt.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  const clientId = `frontend_${Math.random().toString(16).slice(3)}`;
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  const actionEventsTopic = `chats/${chat.id}/actionEvents`;
  const processEventsTopic = `users/${chat.userId}/processEvents`;

  useEffect(() => {
    // If we already connected once, skip
    if (clientRef.current) return;

    const mqttClient = mqtt.connect(mqttHost, {
      clientId,
      username: 'frontend',
      password: localStorageToken?.replaceAll('"', ''),
      will: {
        topic: 'connections',
        payload: Buffer.from(
          JSON.stringify({
            clientId,
            deviceType: 'browser',
            status: 'disconnected',
          })
        ),
        qos: 1,
        retain: false,
      },
    });

    clientRef.current = mqttClient;

    // Subscribe to actionEvents only if we have onActionEvent
    if (onActionEvent) {
      mqttClient.subscribe(actionEventsTopic);
    }
    // Subscribe to processEvents only if we have onProcessEvent
    if (onProcessEvent) {
      mqttClient.subscribe(processEventsTopic);
    }

    // Dispatch incoming messages to the right callback
    const handleEvent = (topic: string, message: Buffer) => {
      const data = JSON.parse(message.toString());
      if (topic.endsWith('actionEvents') && onActionEvent) {
        onActionEvent(data);
      } else if (topic.endsWith('processEvents') && onProcessEvent) {
        onProcessEvent(data);
      }
    };

    mqttClient.on('message', handleEvent);

    mqttClient.on('connect', () => {
      // Publish status on connect
      mqttClient.publish(
        'connections',
        JSON.stringify({
          clientId,
          deviceType: 'browser',
          status: 'connected',
        }),
        { qos: 1 }
      );
    });

    // Cleanup if unmounts or if chat changes
    return () => {
      if (onActionEvent) {
        mqttClient.unsubscribe(actionEventsTopic);
      }
      if (onProcessEvent) {
        mqttClient.unsubscribe(processEventsTopic);
      }
      mqttClient.off('message', handleEvent);
      mqttClient.end();
      clientRef.current = null;
    };
  }, [chat, clientId, localStorageToken, onActionEvent, onProcessEvent, mqttHost]);
}
