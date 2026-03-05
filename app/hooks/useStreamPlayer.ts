import { useCallback, useEffect, useRef, useState } from 'react';
import { streamPlayerUrl } from '~/constants';
import { getToken } from '~/store/useAuthStore';

const MAX_RECONNECT_DELAY = 30_000;
const INITIAL_RECONNECT_DELAY = 1_000;

export interface UseStreamPlayerOptions {
  onTtsStart?: (messageId: string, format: string) => void;
  onTtsChunk?: (chunk: ArrayBuffer) => void;
  onTtsEnd?: (messageId: string) => void;
  onTtsError?: (messageId: string, error: string) => void;
}

export interface UseStreamPlayerReturn {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
}

export function useStreamPlayer(chatId: string, options: UseStreamPlayerOptions = {}): UseStreamPlayerReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const intentionalCloseRef = useRef(false);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      const token = getToken();
      if (!token) {
        reject(new Error('No auth token available'));
        return;
      }

      intentionalCloseRef.current = false;
      const url = `${streamPlayerUrl}/ws-player?auth=${encodeURIComponent(token)}&chatId=${encodeURIComponent(chatId)}`;
      const ws = new WebSocket(url);
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        setIsConnected(true);
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
        resolve();
      };

      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const msg = JSON.parse(event.data);
            switch (msg.type) {
              case 'tts_start':
                optionsRef.current.onTtsStart?.(msg.messageId, msg.format);
                break;
              case 'tts_end':
                optionsRef.current.onTtsEnd?.(msg.messageId);
                break;
              case 'tts_error':
                optionsRef.current.onTtsError?.(msg.messageId, msg.error);
                break;
            }
          } catch (err) {
            console.error('[StreamPlayer] Failed to parse message', err);
          }
        } else {
          optionsRef.current.onTtsChunk?.(event.data as ArrayBuffer);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        if (!intentionalCloseRef.current) {
          const delay = reconnectDelayRef.current;
          reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);
          console.log(`[StreamPlayer] Reconnecting in ${delay}ms...`);
          reconnectTimerRef.current = setTimeout(() => {
            connect().catch((err) => console.error('[StreamPlayer] Reconnect failed', err));
          }, delay);
        }
      };

      ws.onerror = (event) => {
        console.error('[StreamPlayer] WebSocket error', event);
        reject(new Error('WebSocket connection failed'));
      };

      wsRef.current = ws;
    });
  }, [chatId]);

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    clearReconnectTimer();
    const ws = wsRef.current;
    if (!ws) return;
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
    wsRef.current = null;
  }, [clearReconnectTimer]);

  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      clearReconnectTimer();
      disconnect();
    };
  }, [disconnect, clearReconnectTimer]);

  return { connect, disconnect, isConnected };
}
