import { useCallback } from 'react';
import { useMqttSubscription } from './useMqttSubscription';
import type { MqttMessage } from '~/providers/MqttContext';
import type { ActionEvent, ProcessEvent } from '~/types';

interface UseUserEventsOptions {
  onActionEvent?: (data: ActionEvent) => void;
  onProcessEvent?: (data: ProcessEvent) => void;
  enabled?: boolean;
}

export function useUserEvents(userId: string, { onActionEvent, onProcessEvent, enabled = true }: UseUserEventsOptions) {
  const processEventsTopic = `users/${userId}/processEvents`;
  const actionEventsTopic = `users/${userId}/actionEvents`;

  const handleProcessEvent = useCallback(
    (message: MqttMessage) => {
      try {
        const data: ProcessEvent = JSON.parse(message.payload);
        onProcessEvent?.(data);
      } catch (error) {
        console.error('Failed to parse process event:', error);
      }
    },
    [onProcessEvent, userId]
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
    [onActionEvent, userId]
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
