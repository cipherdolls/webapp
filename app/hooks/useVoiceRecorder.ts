
import { useEffect, useRef, useState } from 'react';

export interface UseVoiceRecorderOptions {
  onRecordingComplete: (blob: Blob) => void;
  silenceThreshold?: number;
  requiredSilenceDuration?: number;
  enableSilenceDetection?: boolean;
}

export default function useVoiceRecorder({
  onRecordingComplete,
  silenceThreshold = 0.03,
  requiredSilenceDuration = 2000,
  enableSilenceDetection = true,
}: UseVoiceRecorderOptions) {
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const dataHandlerRef = useRef<((e: BlobEvent) => void) | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const srcRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const speechStartedRef = useRef<boolean>(false);
  const silenceStartRef = useRef<number | null>(null);

  /* ------------------------------------------------ get stream */
  const getStream = async () => {
    if (streamRef.current && streamRef.current.active) return streamRef.current;
    streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    return streamRef.current;
  };

  /* ------------------------------------------------ meter */
  const startMeter = (stream: MediaStream) => {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AC();
    ctxRef.current = ctx;

    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    an.smoothingTimeConstant = 0.8;

    srcRef.current = src;
    analyserRef.current = an;
    dataRef.current = new Uint8Array(an.fftSize);
    src.connect(an);


    const dataArray = new Uint8Array(an.frequencyBinCount);

    const tick = () => {
      const arr = dataRef.current!;
      an.getByteTimeDomainData(arr);
      const peak = arr.reduce((m, x) => Math.max(m, Math.abs(x - 127)), 0) / 128;

      

      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        setAudioData(new Uint8Array(dataArray));
      }

      if (peak > silenceThreshold) {
        if (!speechStartedRef.current) speechStartedRef.current = true;
        silenceStartRef.current = null;
      } else if (speechStartedRef.current) {
        if (silenceStartRef.current === null) silenceStartRef.current = performance.now();
        else if (performance.now() - silenceStartRef.current >= requiredSilenceDuration) {
          stopRecording();
          return;
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const stopMeter = () => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = null;

    analyserRef.current?.disconnect();
    srcRef.current?.disconnect();
    ctxRef.current?.close();

    analyserRef.current = null;
    srcRef.current = null;
    ctxRef.current = null;

    speechStartedRef.current = false;
    silenceStartRef.current = null;
  };

  /* ------------------------------------------------ recording */
  const startRecording = async () => {
    const stream = await getStream();
    if (enableSilenceDetection) {
      startMeter(stream);
    }

    const rec = new MediaRecorder(stream);
    recorderRef.current = rec;

    

    const onData = (e: BlobEvent) => onRecordingComplete(e.data);
    dataHandlerRef.current = onData;
    rec.addEventListener('dataavailable', onData, { once: true });
    rec.addEventListener('stop', cleanUp, { once: true });
    rec.start();
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const cleanUp = () => {
    if (enableSilenceDetection) {
      stopMeter();
    }
    recorderRef.current = null;
    
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const cancelRecording = () => {
    if (recorderRef.current && dataHandlerRef.current) {
      recorderRef.current.removeEventListener('dataavailable', dataHandlerRef.current);
    }
    stopRecording();
  };

  useEffect(() => {
    return () => {
      cancelRecording();
      cleanUp();
    };
  }, []);

  return { audioData, startRecording, stopRecording, cancelRecording };
}
