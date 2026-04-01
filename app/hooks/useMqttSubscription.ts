import { useEffect, useRef, useCallback } from 'react';
import { useMqtt } from '~/providers/MqttContext';
import type { MqttMessage } from '~/providers/MqttContext';

export const useMqttSubscription = (
  topic: string,
  callback: (message: MqttMessage) => void,
  enabled: boolean = true
) => {
  const { subscribe } = useMqtt();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const latestCallback = useRef(callback);

  // Keep the latest callback in ref to avoid stale closures
  useEffect(() => {
    latestCallback.current = callback;
  }, [callback]);

  // Create a stable callback that always calls the latest version
  const stableCallback = useCallback((message: MqttMessage) => {
    latestCallback.current(message);
  }, []);

  // Subscription lifecycle — only depends on topic and enabled.
  // MqttContext handles broker-level re-subscription on reconnect,
  // so we must NOT tear down subscriptionsRef entries on disconnect.
  useEffect(() => {
    if (!enabled || !topic) {
      return;
    }

    unsubscribeRef.current = subscribe(topic, stableCallback);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [topic, enabled, subscribe, stableCallback]);
};