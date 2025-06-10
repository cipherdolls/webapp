// hooks/useAudioData.ts
import { useEffect, useRef, useState } from 'react';
import { useAudioPlayerContext } from 'react-use-audio-player';

type AudioDataType = 'frequency' | 'time';
type UseAudioDataOptions = {
  type?: AudioDataType;
  fftSize?: number;
  smoothing?: number;
};

const useAudioData = (options: UseAudioDataOptions = {}) => {
  const { type = 'frequency', fftSize = 256, smoothing = 0.8 } = options;
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const { player, isPlaying } = useAudioPlayerContext();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const connectedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Set up audio analysis when player is available and isPlaying
  useEffect(() => {
    if (!player || !isPlaying) {
      setAudioData(null);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    try {
      // Access Howler's internal audio element
      const sound = (player as any)._sounds[0];
      const audioElement = sound?._node;
      if (!audioElement) return;


      // Create audio context if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || 
          (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;

      // Disconnect previous analyser to avoid doubling sound
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      
      // Check if this audio element is already connected
      let source = sourceRef.current;
      if (!source || connectedAudioRef.current !== audioElement) {
        // Disconnect previous source if exists
        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }
        
        // Create new source for this audio element
        source = ctx.createMediaElementSource(audioElement);
        sourceRef.current = source;
        connectedAudioRef.current = audioElement;
      } else {
        // Disconnect source from previous analyser
        source.disconnect();
      }
      
      const analyser = ctx.createAnalyser();
      
      // Configure analyser
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothing;
      
      // Connect nodes
      source.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;

      // Start data capture
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioData = () => {
        if (!analyserRef.current) return;
        
        // Get the requested data type
        if (type === 'frequency') {
          analyserRef.current.getByteFrequencyData(dataArray);
        } else {
          analyserRef.current.getByteTimeDomainData(dataArray);
        }
        
        setAudioData(new Uint8Array(dataArray));
        animationFrameRef.current = requestAnimationFrame(updateAudioData);
      };
      
      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    } catch (error) {
      console.error('Audio analysis failed:', error);
      setAudioData(null);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Don't disconnect source here as it might be reused
    };
  }, [player, isPlaying, type, fftSize, smoothing]);

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  return audioData;
};

export default useAudioData;