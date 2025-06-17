import { useState, useEffect } from 'react';
import { useMicVAD, utils } from '@ricky0123/vad-react';

export interface UseVoiceRecorderOptions {
  onRecordingComplete: (blob: Blob) => void;
  listening?: boolean;
  vadHoldMs?: number;
}

export default function useVoiceRecorder({ onRecordingComplete, listening = true, vadHoldMs = 1800 }: UseVoiceRecorderOptions) {
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);

  const handleSpeechEnd = (audio: Float32Array) => {
    if (!listening) return;

    const wavBuffer = utils.encodeWAV(audio);
    const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    onRecordingComplete(audioBlob);
  };

  const vad = useMicVAD({
    startOnLoad: false,
    redemptionFrames: Math.round(vadHoldMs / 96),
    minSpeechFrames: 4,
    positiveSpeechThreshold: 0.7,
    negativeSpeechThreshold: 0.25,
    preSpeechPadFrames: 5,
    onSpeechEnd: handleSpeechEnd,
    onFrameProcessed: (_, frame) => {
      const u8 = new Uint8Array(frame.length);
      for (let i = 0; i < frame.length; i++) {
        u8[i] = Math.min(255, Math.abs(frame[i]) * 512);
      }
      setAudioData(u8); 
    },
  });

  useEffect(() => {
    if (!vad) return;
    if (listening) {
      vad.start();
    } else {
      vad.pause();
    }
  }, [listening, vad]);

  useEffect(() => {
    return () => {
      vad.pause();
    };
  }, []);

  const stop = () => {
    vad.pause();
  };

  return { audioData, stop };
}
