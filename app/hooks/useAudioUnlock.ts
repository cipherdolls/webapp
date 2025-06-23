import { useState, useCallback } from 'react';
import { useAudioPlayerContext } from 'react-use-audio-player';

// Generate silent audio data URL (very short beep)
const generateSilentAudio = () => {
  // Create a minimal WAV file with silent audio (44100Hz, 16-bit, mono, 0.1 seconds)
  const sampleRate = 44100;
  const duration = 0.1; // 100ms
  const numSamples = Math.floor(sampleRate * duration);
  
  // WAV header
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true); // file size
  view.setUint32(8, 0x57415645, false); // "WAVE"
  
  // fmt chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // audio format (PCM)
  view.setUint16(22, 1, true); // number of channels
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  
  // data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples * 2, true); // data size
  
  // Silent audio data (all zeros)
  const audioData = new Int16Array(numSamples);
  
  // Combine header and data
  const wavFile = new Uint8Array(44 + numSamples * 2);
  wavFile.set(new Uint8Array(header), 0);
  wavFile.set(new Uint8Array(audioData.buffer), 44);
  
  // Convert to base64 data URL
  const base64 = btoa(String.fromCharCode(...wavFile));
  return `data:audio/wav;base64,${base64}`;
};

export const useAudioUnlock = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { load, stop } = useAudioPlayerContext();

  const unlockAudio = useCallback(async () => {
    if (isUnlocked || isUnlocking) return;
    
    setIsUnlocking(true);
    
    try {
      const silentAudio = generateSilentAudio();
      
      // Load and play silent audio to unlock
      load(silentAudio, {
        html5: true,
        autoplay: true, // Must autoplay to unlock
        onload: () => {
          console.log('Audio context unlocked successfully');
          setIsUnlocked(true);
          setIsUnlocking(false);
          // Stop immediately after unlocking
          setTimeout(() => stop(), 100);
        },
        onend: () => {
          setIsUnlocked(true);
          setIsUnlocking(false);
        }
      });
      
      // Try to play the silent audio
      // Note: This needs to be called from a user gesture event
    } catch (error) {
      console.error('Audio unlock failed:', error);
      setIsUnlocking(false);
    }
  }, [isUnlocked, isUnlocking, load, stop]);

  return {
    isUnlocked,
    isUnlocking,
    unlockAudio
  };
}; 