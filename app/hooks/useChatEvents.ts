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
  const processEventsTopic = `chats/${chat.id}/processEvents`;

  useEffect(() => {
    // If we already connected once, skip
    if (clientRef.current) return;

    const client = mqtt.connect(mqttHost, {
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

    clientRef.current = client;

    // Subscribe to actionEvents only if we have onActionEvent
    if (onActionEvent) {
      client.subscribe(actionEventsTopic);
    }
    // Subscribe to processEvents only if we have onProcessEvent
    if (onProcessEvent) {
      client.subscribe(processEventsTopic);
    }

    // Dispatch incoming messages to the right callback
    const handleEvent = (topic: string, message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());

        if (topic.endsWith('actionEvents') && onActionEvent) {
          onActionEvent(data);
        } else if (topic.endsWith('processEvents') && onProcessEvent) {
          onProcessEvent(data);
        }
      } catch (error) {
        console.error('Error parsing MQTT message:', error);
      }
    };

    client.on('message', handleEvent);

    // Attach error handling for MQTT client events
    // client.on('error', (error) => {
    //   console.error('MQTT client error:', error);
    // });

    // client.on('offline', () => {
    //   console.warn('MQTT client is offline.');
    //   // You could also trigger onError here if needed
    // });

    // client.on('close', () => {
    //   console.warn('MQTT client connection closed.');
    //   // Optionally, call onError(new Error('Connection closed'));
    // });

    client.on('connect', () => {
      // Publish status on connect
      client.publish(
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
        client.unsubscribe(actionEventsTopic);
      }
      if (onProcessEvent) {
        client.unsubscribe(processEventsTopic);
      }
      client.off('message', handleEvent);
      client.end();
      clientRef.current = null;
    };
  }, [chat, clientId, localStorageToken, onActionEvent, onProcessEvent, mqttHost]);
}
