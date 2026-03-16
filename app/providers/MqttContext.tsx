import React, { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import mqtt from 'mqtt';
import { Buffer } from 'buffer';
import { useAuthStore } from '~/store/useAuthStore';

export interface MqttMessage {
  topic: string;
  payload: string;
  timestamp: number;
}

export interface MqttConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export interface MqttSubscription {
  topic: string;
  callback: (message: MqttMessage) => void;
}

export interface MqttContextType {
  connectionState: MqttConnectionState;
  subscribe: (topic: string, callback: (message: MqttMessage) => void) => () => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  getSubscriptions: () => string[];
}

export interface MqttConfig {
  brokerUrl: string;
  options?: {
    clientId?: string;
    username?: string;
    password?: string;
    keepAlive?: number;
    reconnectPeriod?: number;
    connectTimeout?: number;
    clean?: boolean;
  };
}

const MqttContext = createContext<MqttContextType | null>(null);

interface MqttProviderProps {
  children: ReactNode;
  config: MqttConfig;
}

export const MqttProvider: React.FC<MqttProviderProps> = ({ children, config }) => {
  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const subscriptionsRef = useRef<Map<string, MqttSubscription[]>>(new Map());
  const subscriptionCountRef = useRef<Map<string, number>>(new Map());
  const [connectionState, setConnectionState] = useState<MqttConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });
  const logout = useAuthStore((state) => state.logout);

  const updateConnectionState = (updates: Partial<MqttConnectionState>) => {
    setConnectionState((prev) => ({ ...prev, ...updates }));
  };

  const isAuthenticationError = (error: Error): boolean => {
    const errorMessage = error.message?.toLowerCase() || '';
    const authErrorPatterns = [
      'connection refused: not authorized',
      'connection refused: bad user name or password',
      'connection refused: identifier rejected',
      'not authorized',
      'bad username or password',
      'authentication failed',
      'unauthorized',
      'authentication error',
      'mqtt authentication failed',
      'websocket connection failed',
      'connection refused',
      'invalid credentials',
      'access denied',
    ];

    return authErrorPatterns.some((pattern) => errorMessage.includes(pattern));
  };

  const handleMessage = useCallback((topic: string, payload: Buffer) => {
    const message: MqttMessage = {
      topic,
      payload: payload.toString(),
      timestamp: Date.now(),
    };

    const subscriptions = subscriptionsRef.current.get(topic) || [];
    subscriptions.forEach((subscription) => {
      try {
        subscription.callback(message);
      } catch (error) {
        console.error(`Error in MQTT message handler for topic ${topic}:`, error);
      }
    });
  }, []);

  const connect = async (): Promise<void> => {
    if (clientRef.current?.connected) {
      return;
    }

    updateConnectionState({ isConnecting: true, error: null });

    try {
      const connectOptions: any = {
        clientId: config.options?.clientId || `mqtt-client-${Math.random().toString(16).slice(2)}`,
        username: config.options?.username,
        password: config.options?.password,
        keepAlive: config.options?.keepAlive || 60,
        reconnectPeriod: config.options?.reconnectPeriod || 1000,
        connectTimeout: config.options?.connectTimeout || 30000,
        clean: config.options?.clean !== false,
      };

      const client = mqtt.connect(config.brokerUrl, connectOptions);

      client.on('connect', () => {
        // console.log('MQTT connected');
        updateConnectionState({
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        });
      });

      client.on('disconnect', () => {
        // console.log('MQTT disconnected');
        updateConnectionState({ isConnected: false, isConnecting: false });
      });

      client.on('reconnect', () => {
        // console.log('MQTT reconnecting...');
        setConnectionState((prev) => ({
          ...prev,
          isConnecting: true,
          error: null,
          reconnectAttempts: prev.reconnectAttempts + 1,
        }));
      });

      client.on('error', (error) => {
        console.error('MQTT error:', error);

        if (isAuthenticationError(error)) {
          console.warn('MQTT authentication failed, disconnecting and signing out user');
          if (clientRef.current) {
            clientRef.current.end(true);
            clientRef.current = null;
          }
          logout().catch(console.error);
          return;
        }

        updateConnectionState({
          isConnected: false,
          isConnecting: false,
          error: error.message,
        });
      });

      client.on('message', handleMessage);

      clientRef.current = client;
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error('Unknown connection error');

      if (isAuthenticationError(errorInstance)) {
        console.warn('MQTT authentication failed during connection, signing out user');
        logout().catch(console.error);
        return;
      }

      updateConnectionState({
        isConnected: false,
        isConnecting: false,
        error: errorInstance.message,
      });
      throw error;
    }
  };

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end();
      clientRef.current = null;
      updateConnectionState({
        isConnected: false,
        isConnecting: false,
        error: null,
        reconnectAttempts: 0,
      });
    }
  }, []);

  const subscribe = useCallback((topic: string, callback: (message: MqttMessage) => void) => {
    const subscription: MqttSubscription = { topic, callback };

    // Add to subscriptions map
    const existingSubscriptions = subscriptionsRef.current.get(topic) || [];
    existingSubscriptions.push(subscription);
    subscriptionsRef.current.set(topic, existingSubscriptions);

    // Track subscription count
    const currentCount = subscriptionCountRef.current.get(topic) || 0;
    const newCount = currentCount + 1;
    subscriptionCountRef.current.set(topic, newCount);

    // Only subscribe to MQTT broker if this is the first subscription for this topic
    if (newCount === 1 && clientRef.current?.connected) {
      // console.log(`[MqttContext] Subscribing to MQTT topic: ${topic}`);
      clientRef.current.subscribe(topic, (error) => {
        if (error) {
          console.error(`Failed to subscribe to ${topic}:`, error);
          console.warn('MQTT subscription rejected, disconnecting and signing out user');
          if (clientRef.current) {
            clientRef.current.end(true);
            clientRef.current = null;
          }
          logout().catch(console.error);
        }
      });
    }

    // Return unsubscribe function
    return () => {
      const subscriptions = subscriptionsRef.current.get(topic) || [];
      const filteredSubscriptions = subscriptions.filter((sub) => sub.callback !== callback);

      // Update subscription count
      const currentCount = subscriptionCountRef.current.get(topic) || 0;
      const newCount = Math.max(0, currentCount - 1);
      subscriptionCountRef.current.set(topic, newCount);

      if (newCount === 0) {
        // No more subscriptions for this topic, unsubscribe from MQTT
        subscriptionsRef.current.delete(topic);
        subscriptionCountRef.current.delete(topic);
        if (clientRef.current?.connected) {
          // console.log(`[MqttContext] Unsubscribing from MQTT topic: ${topic}`);
          clientRef.current.unsubscribe(topic, (error) => {
            if (error) {
              console.error(`Failed to unsubscribe from ${topic}:`, error);
            } else {
              // console.log(`[MqttContext] Successfully unsubscribed from ${topic}`);
            }
          });
        }
      } else {
        // Still have other subscriptions for this topic
        subscriptionsRef.current.set(topic, filteredSubscriptions);
      }
    };
  }, []);

  const getSubscriptions = useCallback((): string[] => {
    return Array.from(subscriptionsRef.current.keys());
  }, []);

  // Re-subscribe to all topics when connection is established
  useEffect(() => {
    if (connectionState.isConnected && clientRef.current) {
      const allTopics = Array.from(subscriptionsRef.current.keys());
      allTopics.forEach((topic) => {
        const subscriptions = subscriptionsRef.current.get(topic) || [];
        if (subscriptions.length > 0) {
          // console.log(`[MqttContext] Re-subscribing to ${topic}`);
          clientRef.current!.subscribe(topic, (error) => {
            if (error) {
              console.error(`Failed to re-subscribe to ${topic}:`, error);
              console.warn('MQTT re-subscription rejected, disconnecting and signing out user');
              if (clientRef.current) {
                clientRef.current.end(true);
                clientRef.current = null;
              }
              logout().catch(console.error);
            }
          });
        }
      });
    }
  }, [connectionState.isConnected]);

  // Auto-connect on mount and reconnect when config changes
  useEffect(() => {
    if (clientRef.current) {
      disconnect();
    }

    connect().catch(console.error);

    return () => {
      disconnect();
    };
  }, [config.brokerUrl, config.options?.clientId, config.options?.username, config.options?.password, disconnect]);

  const contextValue: MqttContextType = {
    connectionState,
    subscribe,
    connect,
    disconnect,
    getSubscriptions,
  };

  return <MqttContext.Provider value={contextValue}>{children}</MqttContext.Provider>;
};

export const useMqtt = (): MqttContextType => {
  const context = useContext(MqttContext);
  if (!context) {
    throw new Error('useMqtt must be used within an MqttProvider');
  }
  return context;
};
