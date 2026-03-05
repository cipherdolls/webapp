import { useCallback, useEffect, useRef, useState } from 'react';
import { streamRecorderUrl } from '~/constants';
import { getToken } from '~/store/useAuthStore';

const MAX_RECONNECT_DELAY = 30_000;
const INITIAL_RECONNECT_DELAY = 1_000;

export interface UseStreamRecorderReturn {
  connect: () => Promise<void>;
  disconnect: () => void;
  startRecording: () => void;
  sendRecordingChunk: (data: ArrayBuffer | Uint8Array | Blob) => void;
  endRecording: () => void;
  isConnected: boolean;
}

export function useStreamRecorder(chatId: string): UseStreamRecorderReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
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

      // Close any stale CONNECTING socket to prevent duplicates
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        if (wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }

      clearReconnectTimer();

      const token = getToken();
      if (!token) {
        reject(new Error('No auth token available'));
        return;
      }

      intentionalCloseRef.current = false;
      const url = `${streamRecorderUrl}/ws-stream?auth=${encodeURIComponent(token)}&chatId=${encodeURIComponent(chatId)}`;
      const ws = new WebSocket(url);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
        resolve();
      };

      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'error') {
              console.error('[StreamRecorder] Server error:', msg.message);
            }
          } catch {
            // ignore
          }
        }
      };

      ws.onclose = () => {
        // Only handle if this is still the current socket
        if (wsRef.current !== ws) return;
        setIsConnected(false);
        wsRef.current = null;
        if (!intentionalCloseRef.current) {
          const delay = reconnectDelayRef.current;
          reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);
          console.log(`[StreamRecorder] Reconnecting in ${delay}ms...`);
          reconnectTimerRef.current = setTimeout(() => {
            connect().catch((err) => console.error('[StreamRecorder] Reconnect failed', err));
          }, delay);
        }
      };

      ws.onerror = (event) => {
        console.error('[StreamRecorder] WebSocket error', event);
        reject(new Error('WebSocket connection failed'));
      };
    });
  }, [chatId, clearReconnectTimer]);

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

  const startRecording = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'recording_start' }));
  }, []);

  const sendRecordingChunk = useCallback((data: ArrayBuffer | Uint8Array | Blob) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(data);
  }, []);

  const endRecording = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'recording_end' }));
  }, []);

  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      clearReconnectTimer();
      disconnect();
    };
  }, [disconnect, clearReconnectTimer]);

  return { connect, disconnect, startRecording, sendRecordingChunk, endRecording, isConnected };
}
