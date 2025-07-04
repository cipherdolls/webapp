import { useCallback } from 'react';
import { useMqttSubscription } from './useMqttSubscription';
import type { MqttMessage } from '~/providers/MqttContext';
import type { ActionEvent, ProcessEvent } from '~/types';

interface UseChatEventsOptions {
  onActionEvent?: (data: ActionEvent) => void;
  onProcessEvent?: (data: ProcessEvent) => void;
  enabled?: boolean;
}

export function useChatEvents(chatId: string, { onActionEvent, onProcessEvent, enabled = true }: UseChatEventsOptions) {
  const processEventsTopic = `chats/${chatId}/processEvents`;
  const actionEventsTopic = `chats/${chatId}/actionEvents`;

  const handleProcessEvent = useCallback(
    (message: MqttMessage) => {
      try {
        const data: ProcessEvent = JSON.parse(message.payload);
        onProcessEvent?.(data);
      } catch (error) {
        console.error('Failed to parse process event:', error);
      }
    },
    [onProcessEvent, chatId]
  );

  const handleActionEvent = useCallback(
    (message: MqttMessage) => {
      try {
        const data: ActionEvent = JSON.parse(message.payload);
        onActionEvent?.(data);
      } catch (error) {
        console.error('Failed to parse action event:', error);
      }
    },
    [onActionEvent, chatId]
  );

  // Subscribe to process events
  useMqttSubscription(processEventsTopic, handleProcessEvent, enabled && !!onProcessEvent);

  // Subscribe to action events
  useMqttSubscription(actionEventsTopic, handleActionEvent, enabled && !!onActionEvent);

  return {
    processEventsTopic,
    actionEventsTopic,
  };
}
