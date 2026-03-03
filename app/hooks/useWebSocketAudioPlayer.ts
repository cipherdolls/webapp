import { useCallback, useRef } from 'react';
import { useAudioPlayerContext } from 'react-use-audio-player';
import { useChatStore } from '~/store/useChatStore';
import { ChatState } from '~/components/chat/types/chatState';
import type { UseStreamPlayerOptions } from './useStreamPlayer';

export interface UseWebSocketAudioPlayerOptions {
  onPlaybackEnd?: () => void;
}

export function useWebSocketAudioPlayer(options: UseWebSocketAudioPlayerOptions = {}): UseStreamPlayerOptions {
  const { load } = useAudioPlayerContext();
  const chunksRef = useRef<ArrayBuffer[]>([]);
  const blobUrlRef = useRef<string | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const cleanupBlobUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const onTtsStart = useCallback((_messageId: string, _format: string) => {
    chunksRef.current = [];
    cleanupBlobUrl();
    useChatStore.getState().setCurrentChatState(ChatState.avatarSpeaking);
  }, []);

  const onTtsChunk = useCallback((chunk: ArrayBuffer) => {
    chunksRef.current.push(chunk);
  }, []);

  const onTtsEnd = useCallback(
    (_messageId: string) => {
      const chunks = chunksRef.current;
      chunksRef.current = [];

      if (chunks.length === 0 || useChatStore.getState().silentMode) {
        optionsRef.current.onPlaybackEnd?.();
        return;
      }

      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;

      load(blobUrl, {
        html5: true,
        autoplay: true,
        format: 'mp3',
        onend: () => {
          cleanupBlobUrl();
          optionsRef.current.onPlaybackEnd?.();
        },
      });
    },
    [load]
  );

  const onTtsError = useCallback((_messageId: string, error: string) => {
    console.error(`[TTS] Error: ${error}`);
    chunksRef.current = [];
    cleanupBlobUrl();
    optionsRef.current.onPlaybackEnd?.();
  }, []);

  return { onTtsStart, onTtsChunk, onTtsEnd, onTtsError };
}
