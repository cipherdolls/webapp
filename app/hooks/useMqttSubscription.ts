import { useEffect, useRef, useCallback } from 'react';
import { useMqtt } from '~/providers/MqttContext';
import type { MqttMessage } from '~/providers/MqttContext';

// Dev logging utility
const devLog = (message: string, ...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(message, ...args);
  }
};

export const useMqttSubscription = (
  topic: string,
  callback: (message: MqttMessage) => void,
  enabled: boolean = true
) => {
  const { subscribe, connectionState } = useMqtt();
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

  // Main subscription effect - handles all subscription logic
  useEffect(() => {
    // Clean up existing subscription first
    if (unsubscribeRef.current) {
      // devLog(`[useMqttSubscription] Cleaning up existing subscription for topic: ${topic}`);
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Check if we should establish a new subscription
    if (!enabled || !topic || !connectionState.isConnected) {
      // devLog(`[useMqttSubscription] Skipping subscription - enabled: ${enabled}, topic: ${topic}, connected: ${connectionState.isConnected}`);
      return;
    }

    // Establish new subscription
    // devLog(`[useMqttSubscription] Setting up subscription for topic: ${topic}`);
    unsubscribeRef.current = subscribe(topic, stableCallback);

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        // devLog(`[useMqttSubscription] Cleaning up subscription for topic: ${topic}`);
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [topic, enabled, connectionState.isConnected, subscribe, stableCallback]);
};