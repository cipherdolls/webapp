import { useCallback } from 'react';
import { useMqttSubscription } from './useMqttSubscription';
import type { MqttMessage } from '~/providers/MqttContext';
import type { ActionEvent, ProcessEvent } from '~/types';

interface BalanceUpdateEvent {
  userId: string;
  weiBalance?: string;
  freeWeiBalance?: string;
  tokenBalance?: number;
}

interface UseUserEventsOptions {
  onActionEvent?: (data: ActionEvent) => void;
  onProcessEvent?: (data: ProcessEvent) => void;
  onBalanceUpdate?: (data: BalanceUpdateEvent) => void;
  enabled?: boolean;
}

export function useUserEvents(userId: string, { onActionEvent, onProcessEvent, onBalanceUpdate, enabled = true }: UseUserEventsOptions) {
  const processEventsTopic = `users/${userId}/processEvents`;
  const actionEventsTopic = `users/${userId}/actionEvents`;
  const balanceUpdatesTopic = `users/${userId}/balanceUpdates`;

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

  const handleBalanceUpdate = useCallback(
    (message: MqttMessage) => {
      try {
        const data: BalanceUpdateEvent = JSON.parse(message.payload);
        onBalanceUpdate?.(data);
      } catch (error) {
        console.error('Failed to parse balance update event:', error);
      }
    },
    [onBalanceUpdate, userId]
  );

  // Subscribe to process events
  useMqttSubscription(processEventsTopic, handleProcessEvent, enabled && !!onProcessEvent);

  // Subscribe to action events
  useMqttSubscription(actionEventsTopic, handleActionEvent, enabled && !!onActionEvent);

  // Subscribe to balance updates
  useMqttSubscription(balanceUpdatesTopic, handleBalanceUpdate, enabled && !!onBalanceUpdate);

  return {
    processEventsTopic,
    actionEventsTopic,
    balanceUpdatesTopic,
  };
}
