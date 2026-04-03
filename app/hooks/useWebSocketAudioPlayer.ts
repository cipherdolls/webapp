import { useCallback, useEffect, useRef } from 'react';
import { useChatStore } from '~/store/useChatStore';
import { ChatState } from '~/components/chat/types/chatState';
import type { UseStreamPlayerOptions } from './useStreamPlayer';

const PCM_SAMPLE_RATE = 24000;
const BYTES_PER_SAMPLE = 2; // 16-bit PCM

export interface UseWebSocketAudioPlayerOptions {
  onPlaybackEnd?: () => void;
}

export interface UseWebSocketAudioPlayerReturn {
  ttsCallbacks: UseStreamPlayerOptions;
  stopTts: () => void;
}

export function useWebSocketAudioPlayer(options: UseWebSocketAudioPlayerOptions = {}): UseWebSocketAudioPlayerReturn {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const streamEndedRef = useRef(false);
  const activeSourcesRef = useRef(0);
  const leftoverRef = useRef<Uint8Array | null>(null);
  const chunkCountRef = useRef(0);
  const ttsStartTimeRef = useRef(0);

  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    nextStartTimeRef.current = 0;
    streamEndedRef.current = false;
    activeSourcesRef.current = 0;
    leftoverRef.current = null;
  }, []);

  const scheduleChunk = useCallback(
    (aligned: ArrayBuffer) => {
      const ctx = audioContextRef.current;
      if (!ctx || aligned.byteLength < BYTES_PER_SAMPLE) return;

      const int16 = new Int16Array(aligned);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, PCM_SAMPLE_RATE);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;

      activeSourcesRef.current++;
      source.onended = () => {
        activeSourcesRef.current--;
        if (streamEndedRef.current && activeSourcesRef.current === 0) {
          cleanup();
          optionsRef.current.onPlaybackEnd?.();
        }
      };
    },
    [cleanup]
  );

  const onTtsStart = useCallback(
    (_messageId: string, _format: string) => {
      cleanup();

      if (useChatStore.getState().silentMode) return;

      useChatStore.getState().setCurrentChatState(ChatState.avatarSpeaking);

      const ctx = new AudioContext({ sampleRate: PCM_SAMPLE_RATE });
      audioContextRef.current = ctx;
      nextStartTimeRef.current = ctx.currentTime;
      streamEndedRef.current = false;
      activeSourcesRef.current = 0;
      leftoverRef.current = null;
      chunkCountRef.current = 0;
      ttsStartTimeRef.current = performance.now();
      console.log(`[TTS] Stream started`);
    },
    [cleanup]
  );

  const onTtsChunk = useCallback(
    (chunk: ArrayBuffer) => {
      if (!audioContextRef.current || useChatStore.getState().silentMode) return;

      let data: Uint8Array;
      if (leftoverRef.current) {
        // Prepend leftover byte(s) from previous chunk
        data = new Uint8Array(leftoverRef.current.length + chunk.byteLength);
        data.set(leftoverRef.current, 0);
        data.set(new Uint8Array(chunk), leftoverRef.current.length);
        leftoverRef.current = null;
      } else {
        data = new Uint8Array(chunk);
      }

      // Keep leftover bytes that don't align to sample boundary
      const remainder = data.byteLength % BYTES_PER_SAMPLE;
      if (remainder !== 0) {
        leftoverRef.current = data.slice(data.byteLength - remainder);
        data = data.slice(0, data.byteLength - remainder);
      }

      if (data.byteLength >= BYTES_PER_SAMPLE) {
        chunkCountRef.current++;
        if (chunkCountRef.current === 1) {
          console.log(`[TTS] First audio chunk received: ${Math.round(performance.now() - ttsStartTimeRef.current)}ms after tts_start, size=${data.byteLength} bytes`);
        }
        const aligned = new ArrayBuffer(data.byteLength);
        new Uint8Array(aligned).set(data);
        scheduleChunk(aligned);
      }
    },
    [scheduleChunk]
  );

  const onTtsEnd = useCallback((_messageId: string) => {
    console.log(`[TTS] Stream ended: ${chunkCountRef.current} chunks, total ${Math.round(performance.now() - ttsStartTimeRef.current)}ms`);
    streamEndedRef.current = true;
    leftoverRef.current = null;
    if (activeSourcesRef.current === 0) {
      cleanup();
      optionsRef.current.onPlaybackEnd?.();
    }
  }, [cleanup]);

  const onTtsError = useCallback(
    (_messageId: string, error: string) => {
      console.error(`[TTS] Error: ${error}`);
      cleanup();
      optionsRef.current.onPlaybackEnd?.();
    },
    [cleanup]
  );

  useEffect(() => {
    useChatStore.getState().setStopTts(cleanup);
  }, [cleanup]);

  return {
    ttsCallbacks: { onTtsStart, onTtsChunk, onTtsEnd, onTtsError },
    stopTts: cleanup,
  };
}
