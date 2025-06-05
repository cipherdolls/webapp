import { useRef, useEffect, useCallback } from 'react';

interface UseAudioAnalyzerProps {
  onAudioData: (data: Uint8Array) => void;
  onFinish: () => void;
}

const useAudioAnalyzer = ({ onAudioData, onFinish }: UseAudioAnalyzerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    audioRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
  }, []);

  // useEffect(() => {
  //   return cleanup;
  // }, [cleanup]);

  const setupAudioContext = useCallback(() => {
    if (!audioRef.current) return;

    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    const analyzeAudio = () => {
      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      onAudioData(dataArray);
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    };

    analyzeAudio();
  }, [onAudioData]);

  const playAudio = useCallback(async (audioUrl: string) => {
    try {
      cleanup();

      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;

      audio.addEventListener('ended', () => {
        cleanup();
        onFinish();
      });

      audio.src = audioUrl;
      setupAudioContext();
      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      cleanup();
      onFinish();
    }
  }, [cleanup, setupAudioContext, onFinish]);

  const stopAudio = useCallback(() => {
    cleanup();
    onFinish();
  }, [cleanup, onFinish]);

  return {
    playAudio,
    stopAudio
  };
};

export default useAudioAnalyzer;