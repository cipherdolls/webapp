import { useState, useRef, useCallback, useEffect } from 'react';

// --- Types and constants ---
interface UseVoiceRecorderOptions {
  autoStopOnSilence?: boolean;
  silenceThreshold?: number;
  requiredSilenceDuration?: number;
  analysisInterval?: number;
  onRecordingComplete: (blob: Blob | null) => void;
  onStateChange?: (state: RecordingState) => void;
}

export enum RecordingState {
  Idle = 'idle',
  RequestingMic = 'requesting_mic',
  Initializing = 'initializing',
  Recording = 'recording',
  Stopping = 'stopping',
  Error = 'error',
}

type AudioNodes = {
  context: AudioContext | null;
  analyser: AnalyserNode | null;
  source: MediaStreamAudioSourceNode | null;
};

type RecordingResources = {
  recorder: MediaRecorder | null;
  stream: MediaStream | null;
  chunks: Blob[];
};

const DEFAULTS = {
  AUTO_STOP_ON_SILENCE: false,
  SILENCE_THRESHOLD: 0.01,
  REQUIRED_SILENCE_DURATION: 1500,
  ANALYSIS_INTERVAL: 300,
} as const;

// ---------------------------

export const useVoiceRecorder = ({
  autoStopOnSilence = DEFAULTS.AUTO_STOP_ON_SILENCE,
  silenceThreshold = DEFAULTS.SILENCE_THRESHOLD,
  requiredSilenceDuration = DEFAULTS.REQUIRED_SILENCE_DURATION,
  analysisInterval = DEFAULTS.ANALYSIS_INTERVAL,
  onRecordingComplete,
  onStateChange,
}: UseVoiceRecorderOptions) => {
  // --- State management ---
  const [state, setState] = useState({
    recordingState: RecordingState.Idle,
    hasMicAccess: null as boolean | null,
    error: null as Error | null,
  });

  // --- Refs grouping ---
  const refs = useRef({
    audio: { context: null, analyser: null, source: null } as AudioNodes,
    recording: { recorder: null, stream: null, chunks: [] } as RecordingResources,
    timers: { silence: null as NodeJS.Timeout | null, analysis: null as NodeJS.Timeout | null },
    hasVoiceBeenDetected: false,
  });

  // --- Callback refs ---
  const callbacks = useRef({ onRecordingComplete, onStateChange });

  // --- State synchronization ---
  useEffect(() => {
    callbacks.current = { onRecordingComplete, onStateChange };
  }, [onRecordingComplete, onStateChange]);

  // --- State update handler ---
  const updateState = useCallback((newState: RecordingState) => {
    setState((prev) => ({ ...prev, recordingState: newState }));
    callbacks.current.onStateChange?.(newState);
  }, []);

  // --- Audio analysis cleanup ---
  const cleanupAudioAnalysis = useCallback(() => {
    const { timers, audio } = refs.current;
    timers.silence && clearTimeout(timers.silence);
    timers.analysis && clearInterval(timers.analysis);
    audio.source?.disconnect();
    audio.analyser?.disconnect();
    audio.context?.close();
    refs.current.audio = { context: null, analyser: null, source: null };
    refs.current.timers = { silence: null, analysis: null };
  }, []);

  // --- Media handling ---
  const handleDataAvailable = useCallback((event: BlobEvent) => {
    if (event.data.size > 0) {
      refs.current.recording.chunks.push(event.data);
    }
  }, []);

  const processRecordingResult = useCallback(() => {
    const { chunks, recorder } = refs.current.recording;
    const blob = new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' });
    refs.current.recording.chunks = [];

    const shouldKeepResult = refs.current.hasVoiceBeenDetected && blob.size > 0;
    callbacks.current.onRecordingComplete(shouldKeepResult ? blob : null);
  }, []);

  // --- Recording control ---
  const stopRecording = useCallback(async () => {
    const { recording, audio } = refs.current;
    if (!recording.recorder || recording.recorder.state === 'inactive') return;

    cleanupAudioAnalysis();
    recording.recorder.requestData();

    try {
      if (!recording.recorder) return;
      const recorder = recording.recorder;
      await new Promise<void>((resolve, reject) => {
        recorder.onstop = () => resolve();
        recorder.onerror = (e) => reject(e);
        recorder.stop();
      });

      processRecordingResult();
      recording.stream?.getTracks().forEach((track) => track.stop());
    } catch (error) {
      setState((prev) => ({ ...prev, error: error instanceof Error ? error : new Error('Stop failed') }));
      updateState(RecordingState.Error);
    } finally {
      refs.current.recording = { recorder: null, stream: null, chunks: [] };
      updateState(RecordingState.Idle);
    }
  }, [cleanupAudioAnalysis, processRecordingResult, updateState]);

  // --- Silence detection ---
  const analyzeAudio = useCallback(() => {
    const { audio, timers } = refs.current;
    if (!audio.analyser) return;

    const buffer = new Uint8Array(audio.analyser.fftSize);
    audio.analyser.getByteTimeDomainData(buffer);

    const volume = buffer.reduce((sum, val) => sum + Math.abs(val - 128), 0) / (buffer.length * 128);
    refs.current.hasVoiceBeenDetected ||= volume > silenceThreshold;

    if (volume < silenceThreshold && refs.current.hasVoiceBeenDetected) {
      timers.silence = timers.silence || setTimeout(stopRecording, requiredSilenceDuration);
    } else if (timers.silence) {
      clearTimeout(timers.silence);
      timers.silence = null;
    }
  }, [silenceThreshold, requiredSilenceDuration, stopRecording]);

  // --- Recording setup ---
  const initializeAudioAnalysis = async (stream: MediaStream) => {
    const { audio } = refs.current;
    audio.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    audio.analyser = audio.context.createAnalyser();
    audio.analyser.fftSize = 2048;
    audio.source = audio.context.createMediaStreamSource(stream);
    audio.source.connect(audio.analyser);

    refs.current.timers.analysis = setInterval(analyzeAudio, analysisInterval);
  };

  const startRecording = useCallback(async () => {
    if (state.recordingState !== RecordingState.Idle) return;

    refs.current.hasVoiceBeenDetected = false;
    updateState(RecordingState.Initializing);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

      refs.current.recording = { recorder, stream, chunks: [] };
      recorder.addEventListener('dataavailable', handleDataAvailable);
      recorder.start(500);

      if (autoStopOnSilence) await initializeAudioAnalysis(stream);
      updateState(RecordingState.Recording);
    } catch (error) {
      cleanupAudioAnalysis();
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Recording failed'),
        hasMicAccess: error instanceof Error && error.name === 'NotAllowedError' ? false : prev.hasMicAccess,
      }));
      updateState(RecordingState.Error);
    }
  }, [autoStopOnSilence, handleDataAvailable, state.recordingState, updateState, cleanupAudioAnalysis]);

  // --- Initial mic check ---
  useEffect(() => {
    if (!navigator.mediaDevices) {
      setState((prev) => ({ ...prev, hasMicAccess: false, error: new Error('MediaDevices unsupported') }));
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => setState((prev) => ({ ...prev, hasMicAccess: true })))
      .catch((error) =>
        setState((prev) => ({ ...prev, hasMicAccess: false, error: error instanceof Error ? error : new Error('Mic access denied') }))
      );
  }, []);

  // --- Cleanup ---
  useEffect(
    () => () => {
      cleanupAudioAnalysis();
      refs.current.recording.stream?.getTracks().forEach((track) => track.stop());
      refs.current.recording.recorder?.removeEventListener('dataavailable', handleDataAvailable);
    },
    [cleanupAudioAnalysis, handleDataAvailable]
  );

  return {
    recordingState: state.recordingState,
    hasMicAccess: state.hasMicAccess,
    error: state.error,
    startRecording,
    stopRecording,
  };
};
