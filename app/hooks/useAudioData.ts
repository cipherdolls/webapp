// hooks/useAudioData.ts
import { useEffect, useRef } from 'react';
import { useAudioPlayerContext } from 'react-use-audio-player';

type AudioDataType = 'frequency' | 'time';
type UseAudioDataOptions = {
  type?: AudioDataType;
  fftSize?: number;
  smoothing?: number;
};

const audioContextRef = { current: null as AudioContext | null };
const sourceNodes = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();

const getAudioContext = () => {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContextRef.current;
};

const useAudioData = (options: UseAudioDataOptions = {}) => {
  const { type = 'frequency', fftSize = 256, smoothing = 0.8 } = options;
  const { player, isPlaying } = useAudioPlayerContext();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(0));
  const rafId = useRef(0);

  useEffect(() => {
    if (!player || !isPlaying) {
      dataArrayRef.current = new Uint8Array(0);
      return;
    }

    try {
      const sound = (player as any)._sounds[0];
      const audioElement = sound?._node;
      if (!audioElement) return;

      const ctx = getAudioContext();
      let source = sourceNodes.get(audioElement);

      if (!source) {
        source = ctx.createMediaElementSource(audioElement);
        sourceNodes.set(audioElement, source);
      }

      // Disconnect previous connections
      if (analyserRef.current) {
        source.disconnect(analyserRef.current);
        analyserRef.current.disconnect();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothing;
      
      source.connect(analyser);
      analyser.connect(ctx.destination);
      
      analyserRef.current = analyser;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      const updateData = () => {
        if (!analyserRef.current) return;
        
        if (type === 'frequency') {
          analyserRef.current.getByteFrequencyData(dataArray);
        } else {
          analyserRef.current.getByteTimeDomainData(dataArray);
        }
        
        rafId.current = requestAnimationFrame(updateData);
      };
      
      rafId.current = requestAnimationFrame(updateData);
    } catch (error) {
      console.error('Audio analysis error:', error);
      dataArrayRef.current = new Uint8Array(0);
    }

    return () => {
      cancelAnimationFrame(rafId.current);
      analyserRef.current?.disconnect();
    };
  }, [player, isPlaying, type, fftSize, smoothing]);

  return dataArrayRef;
};

export default useAudioData;