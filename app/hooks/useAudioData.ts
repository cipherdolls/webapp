// hooks/useAudioData.ts
import { useEffect, useRef, useState } from 'react';
import { useAudioPlayerContext } from 'react-use-audio-player';

type AudioDataType = 'frequency' | 'time';
type UseAudioDataOptions = {
  type?: AudioDataType;
  fftSize?: number;
  smoothing?: number;
};

// Global registry to track audio elements and their sources
class AudioSourceRegistry {
  private static instance: AudioSourceRegistry;
  private sourceMap = new Map<HTMLAudioElement, MediaElementAudioSourceNode>();
  private globalContext: AudioContext | null = null;
  
  static getInstance(): AudioSourceRegistry {
    if (!AudioSourceRegistry.instance) {
      AudioSourceRegistry.instance = new AudioSourceRegistry();
    }
    return AudioSourceRegistry.instance;
  }
  
  getOrCreateContext(): AudioContext {
    if (!this.globalContext) {
      this.globalContext = new (window.AudioContext || 
        (window as any).webkitAudioContext)();
    }
    return this.globalContext;
  }
  
  getOrCreateSource(audioElement: HTMLAudioElement): MediaElementAudioSourceNode {
    let source = this.sourceMap.get(audioElement);
    
    if (!source) {
      try {
        const context = this.getOrCreateContext();
        source = context.createMediaElementSource(audioElement);
        this.sourceMap.set(audioElement, source);
      } catch (error) {
        // If element is already connected, try to find existing source
        const existingSource = this.sourceMap.get(audioElement);
        if (existingSource) {
          return existingSource;
        }
        throw error;
      }
    }
    
    return source;
  }
  
  disconnectSource(audioElement: HTMLAudioElement) {
    const source = this.sourceMap.get(audioElement);
    if (source) {
      source.disconnect();
    }
  }
  
  removeSource(audioElement: HTMLAudioElement) {
    this.sourceMap.delete(audioElement);
  }
  
  cleanup() {
    this.sourceMap.clear();
    if (this.globalContext?.state !== 'closed') {
      this.globalContext?.close();
      this.globalContext = null;
    }
  }
}

const useAudioData = (options: UseAudioDataOptions = {}) => {
  const { type = 'frequency', fftSize = 256, smoothing = 0.8 } = options;
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const { player, isPlaying } = useAudioPlayerContext();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const sourceRegistry = AudioSourceRegistry.getInstance();

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

      // Get global audio context from registry
      const ctx = sourceRegistry.getOrCreateContext();

      // Disconnect previous analyser to avoid doubling sound
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      
      // Get or create source using registry
      const source = sourceRegistry.getOrCreateSource(audioElement);
      
      // Disconnect source from any previous connections
      source.disconnect();
      
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
      // Disconnect analyser but keep source for reuse
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
    };
  }, [player, isPlaying, type, fftSize, smoothing]);

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      // Don't close audio context as other instances might be using it
    };
  }, []);

  return audioData;
};

export default useAudioData;