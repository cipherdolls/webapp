import { useCallback, useEffect, useRef, useState } from 'react';
import { streamRecorderUrl } from '~/constants';
import { getToken } from '~/store/useAuthStore';

interface UseStreamRecorderReturn {
  open: () => Promise<void>;
  send: (data: ArrayBuffer | Uint8Array | Blob) => void;
  close: () => void;
  isConnected: boolean;
}

export function useStreamRecorder(chatId: string): UseStreamRecorderReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const open = useCallback((): Promise<void> => {
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

      const url = `${streamRecorderUrl}/ws-stream?auth=${encodeURIComponent(token)}&chatId=${encodeURIComponent(chatId)}`;
      const ws = new WebSocket(url);
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        setIsConnected(true);
        resolve();
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
      };

      ws.onerror = (event) => {
        console.error('[StreamRecorder] WebSocket error', event);
        reject(new Error('WebSocket connection failed'));
      };

      wsRef.current = ws;
    });
  }, [chatId]);

  const send = useCallback((data: ArrayBuffer | Uint8Array | Blob) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(data);
  }, []);

  const close = useCallback(() => {
    const ws = wsRef.current;
    if (!ws) return;
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
    wsRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      close();
    };
  }, [close]);

  return { open, send, close, isConnected };
}
