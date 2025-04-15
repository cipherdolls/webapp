import { useState, useRef, useCallback, useEffect } from 'react';

// --- Types and parameters ---
interface UseVoiceRecorderOptions {
  // --- New option ---
  autoStopOnSilence?: boolean; // true - auto-stop on silence, false - only manual stop
  // ------------------
  silenceThreshold?: number;
  requiredSilenceDuration?: number;
  analysisInterval?: number;
  onRecordingComplete: (blob: Blob) => void;
  onError?: (error: Error) => void;
  onMicAccessChange?: (hasAccess: boolean) => void;
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

// --- Default values ---
const DEFAULT_AUTO_STOP_ON_SILENCE = false; // Enable auto-stop by default
const DEFAULT_SILENCE_THRESHOLD = 0.01;
const DEFAULT_REQUIRED_SILENCE_DURATION = 1500;
const DEFAULT_ANALYSIS_INTERVAL = 300;
// -----------------------------

export const useVoiceRecorder = ({
  autoStopOnSilence = DEFAULT_AUTO_STOP_ON_SILENCE, // Use new option
  silenceThreshold = DEFAULT_SILENCE_THRESHOLD,
  requiredSilenceDuration = DEFAULT_REQUIRED_SILENCE_DURATION,
  analysisInterval = DEFAULT_ANALYSIS_INTERVAL,
  onRecordingComplete,
  onError,
  onMicAccessChange,
  onStateChange,
}: UseVoiceRecorderOptions) => {
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.Idle);
  const [hasMicAccess, setHasMicAccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const recordingStateRef = useRef(recordingState);
  const recorder = useRef<MediaRecorder | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyserNode = useRef<AnalyserNode | null>(null);
  const sourceNode = useRef<MediaStreamAudioSourceNode | null>(null);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const analysisIntervalId = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const onRecordingCompleteRef = useRef(onRecordingComplete);
  const onErrorRef = useRef(onError);
  const onMicAccessChangeRef = useRef(onMicAccessChange);
  const onStateChangeRef = useRef(onStateChange);

  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  useEffect(() => {
    onRecordingCompleteRef.current = onRecordingComplete;
    onErrorRef.current = onError;
    onMicAccessChangeRef.current = onMicAccessChange;
    onStateChangeRef.current = onStateChange;
  }, [onRecordingComplete, onError, onMicAccessChange, onStateChange]);

  const updateState = useCallback(
    (newState: RecordingState) => {
      setRecordingState(newState);
      onStateChangeRef.current?.(newState);
      if (newState === RecordingState.Error && error) {
        onErrorRef.current?.(error);
      }
    },
    [error]
  );

  useEffect(() => {
    const checkInitialMicAccess = async () => {
      // ... (mic access check logic remains unchanged)
      try {
        updateState(RecordingState.RequestingMic);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setHasMicAccess(true);
        onMicAccessChangeRef.current?.(true);
        updateState(RecordingState.Idle);
      } catch (err) {
        console.error('Initial microphone access check failed:', err);
        setHasMicAccess(false);
        onMicAccessChangeRef.current?.(false);
        setError(err instanceof Error ? err : new Error('Failed to get microphone access'));
        updateState(RecordingState.Error);
      }
    };
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      checkInitialMicAccess();
    } else {
      setHasMicAccess(false);
      onMicAccessChangeRef.current?.(false);
      setError(new Error('MediaDevices API not supported'));
      updateState(RecordingState.Error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to clean up ONLY silence analysis resources
  const cleanupSilenceDetection = useCallback(() => {
    // console.log('Cleaning up silence detection resources...');
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    if (analysisIntervalId.current) clearInterval(analysisIntervalId.current);
    silenceTimer.current = null;
    analysisIntervalId.current = null;
    // Disconnect nodes if they were created
    sourceNode.current?.disconnect();
    analyserNode.current?.disconnect(); // Disconnecting from source is enough
    sourceNode.current = null;
    analyserNode.current = null;
  }, []);

  const handleDataAvailable = useCallback((event: BlobEvent) => {
    if (event.data.size > 0) {
      recordedChunks.current.push(event.data);
    }
  }, []);

  // Complete recording stop and cleanup
  const performStopRecording = useCallback(() => {
    if (![RecordingState.Recording, RecordingState.Initializing].includes(recordingStateRef.current)) {
      console.warn('Invalid state for stopping:', recordingStateRef.current);
      return;
    }

    updateState(RecordingState.Stopping);

    // --- Stop silence analysis if it was active ---
    cleanupSilenceDetection();
    // ----------------------------------------------------

    // Stop recorder
    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.removeEventListener('dataavailable', handleDataAvailable);
      recorder.current.onstop = () => {
        // ... (blob handling logic remains unchanged)
        console.log('MediaRecorder stopped. Processing recorded data.');
        const recordedBlob = new Blob(recordedChunks.current, { type: recorder.current?.mimeType || 'audio/webm' });
        recordedChunks.current = [];

        if (recordedBlob.size > 0) {
          onRecordingCompleteRef.current?.(recordedBlob);
        } else {
          console.warn('Recording resulted in an empty blob.');
        }

        recorder.current = null;
        updateState(RecordingState.Idle);
      };
      recorder.current.onerror = (event) => {
        console.error('MediaRecorder error during stop:', event);
        setError(new Error('MediaRecorder failed during stop'));
        updateState(RecordingState.Error);
        recorder.current = null;
        recordedChunks.current = [];
      };

      try {
        // Check state before stop() since onstop may not fire if already inactive
        if (recorder.current.state === 'recording' || recorder.current.state === 'paused') {
          recorder.current?.requestData();
          recorder.current.stop();
        } else {
          // If recorder is inactive, manually simulate onstop logic
          recorder.current.onstop();
        }
      } catch (e) {
        console.error('Error calling recorder.stop():', e);
        setError(e instanceof Error ? e : new Error('Failed to stop recorder'));
        updateState(RecordingState.Error);
        recorder.current = null;
        recordedChunks.current = [];
      }
    } else {
      console.warn('Recorder was not active when stop was called.');
      recordedChunks.current = [];
      updateState(RecordingState.Idle);
    }

    // Stop media stream
    if (streamRef.current) {
      // console.log('Stopping media stream tracks...');
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close AudioContext (only if it was created for silence analysis)
    if (audioContext.current && audioContext.current.state !== 'closed') {
      // console.log("Closing AudioContext...");
      audioContext.current.close().catch((e) => console.error('Error closing AudioContext:', e));
      audioContext.current = null;
    }
  }, [recordingState, cleanupSilenceDetection, handleDataAvailable, updateState]);

  // Silence analysis function (called only if autoStopOnSilence=true)
  const checkSilence = useCallback(() => {
    if (!analyserNode.current || !recorder.current || recorder.current.state !== 'recording') {
      cleanupSilenceDetection();
      return;
    }

    const bufferLength = analyserNode.current.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.current.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += Math.abs(dataArray[i] - 128);
    }
    const average = sum / bufferLength;
    const volume = average / 128.0;

    console.log(`Volume: ${volume.toFixed(4)} | Threshold: ${silenceThreshold}`);

    if (volume < silenceThreshold) {
      if (!silenceTimer.current) {
        silenceTimer.current = setTimeout(() => {
          console.log('Silence detected. Stopping recording...');
          // Request final data before stopping
          if (recorder.current?.state === 'recording') {
            recorder.current.requestData();
          }
          performStopRecording();
        }, requiredSilenceDuration);
      }
    } else {
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
        silenceTimer.current = null;
      }
    }
  }, [cleanupSilenceDetection, performStopRecording, requiredSilenceDuration, silenceThreshold]);

  // Public function to start recording
  const startRecording = useCallback(async () => {
    if (recordingState !== RecordingState.Idle && recordingState !== RecordingState.Error) {
      console.warn(`Cannot start recording from state: ${recordingState}`);
      return;
    }

    setError(null);
    console.log(`Starting recording process... AutoStop: ${autoStopOnSilence}`);
    updateState(RecordingState.Initializing);

    try {
      // --- Get stream --- (remains unchanged)
      if (!hasMicAccess) {
        updateState(RecordingState.RequestingMic);
        console.log('Mic access was not granted initially. Requesting again...');
        try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
          setHasMicAccess(true);
          onMicAccessChangeRef.current?.(true);
          console.log('Mic access granted upon request.');
          updateState(RecordingState.Initializing);
        } catch (err) {
          console.error('Microphone access denied on start:', err);
          setHasMicAccess(false);
          onMicAccessChangeRef.current?.(false);
          setError(err instanceof Error ? err : new Error('Microphone access denied'));
          updateState(RecordingState.Error);
          return;
        }
      } else {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      if (!streamRef.current) {
        throw new Error('Failed to get media stream.');
      }
      // -----------------------

      // --- Conditional Web Audio API setup for silence analysis ---
      if (autoStopOnSilence) {
        console.log('Setting up Web Audio API for silence detection.');
        if (!audioContext.current || audioContext.current.state === 'closed') {
          audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } else if (audioContext.current.state === 'suspended') {
          await audioContext.current.resume();
        }
        analyserNode.current = audioContext.current.createAnalyser();
        analyserNode.current.fftSize = 2048;
        sourceNode.current = audioContext.current.createMediaStreamSource(streamRef.current);
        sourceNode.current.connect(analyserNode.current);
      } else {
        console.log('Silence detection is disabled. Skipping Web Audio setup.');
        // Make sure old analysis refs are cleaned up
        audioContext.current = null;
        analyserNode.current = null;
        sourceNode.current = null;
      }
      // ---------------------------------------------------------

      // --- MediaRecorder setup --- (remains unchanged)
      const options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn(`${options.mimeType} is not supported. Falling back to default.`);
        options.mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          throw new Error('No suitable audio mimeType supported by MediaRecorder');
        }
      }
      recorder.current = new MediaRecorder(streamRef.current, options);
      recordedChunks.current = [];

      recorder.current.addEventListener('dataavailable', handleDataAvailable);

      recorder.current.onstart = () => {
        console.log('MediaRecorder started, state:', recorder.current?.state);
        updateState(RecordingState.Recording);
        // --- Conditional silence analysis start ---
        if (autoStopOnSilence) {
          if (analysisIntervalId.current) clearInterval(analysisIntervalId.current);
          analysisIntervalId.current = setInterval(checkSilence, analysisInterval);
          console.log(`Silence check started with interval ${analysisInterval}ms.`);
        }
        // ---------------------------------
      };

      recorder.current.onerror = (event) => {
        console.error('MediaRecorder error during recording:', event);
        setError(new Error('MediaRecorder failed during recording'));
        performStopRecording();
      };

      recorder.current.start(500);
      // ----------------------------
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err : new Error('Failed to start recording'));
      // Cleanup on error
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      cleanupSilenceDetection(); // Clean up silence analysis
      // Close context if it was created
      if (audioContext.current && audioContext.current.state !== 'closed') {
        audioContext.current.close().catch((e) => console.error('Error closing AudioContext after start failure:', e));
        audioContext.current = null;
      }
      updateState(RecordingState.Error);
    }
  }, [
    recordingState,
    hasMicAccess,
    autoStopOnSilence,
    updateState,
    cleanupSilenceDetection,
    checkSilence,
    handleDataAvailable,
    analysisInterval,
    performStopRecording,
  ]); // Added autoStopOnSilence to dependencies

  // Public function for manual recording stop
  const stopRecording = useCallback(() => {
    if (recordingState === RecordingState.Recording || recordingState === RecordingState.Initializing) {
      // Allow stopping during initialization too
      console.log('Manual stop requested.');
      performStopRecording();
    } else {
      console.warn(`Cannot stop recording from state: ${recordingState}. Already stopping or idle.`);
    }
  }, [recordingState, performStopRecording]);

  // Cleanup effect on unmount
  useEffect(() => {
    return () => {
      console.log('useVoiceRecorder unmounting. Cleaning up...');
      // Stop recorder without saving data
      if (recorder.current && recorder.current.state !== 'inactive') {
        recorder.current.removeEventListener('dataavailable', handleDataAvailable);
        recorder.current.onstop = null;
        recorder.current.onerror = null;
        try {
          if (recorder.current.state === 'recording' || recorder.current.state === 'paused') recorder.current.stop();
        } catch (e) {
          /* ignore */
        }
      }
      // Stop stream
      streamRef.current?.getTracks().forEach((track) => track.stop());
      // Clean up silence analysis
      cleanupSilenceDetection();
      // Close audio context if it exists
      if (audioContext.current && audioContext.current.state !== 'closed') {
        audioContext.current.close().catch((e) => console.error('Error closing AudioContext on unmount:', e));
      }
      // Reset refs
      recorder.current = null;
      streamRef.current = null;
      audioContext.current = null;
      recordedChunks.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanupSilenceDetection, handleDataAvailable]); // Added cleanupSilenceDetection

  return {
    recordingState,
    startRecording,
    stopRecording,
    hasMicAccess,
    error,
  };
};
