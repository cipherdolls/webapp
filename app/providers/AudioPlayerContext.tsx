import React, { createContext, useContext, useState, useCallback } from 'react';

interface AudioPlayerContextType {
  currentAudio: HTMLAudioElement | null;
  playAudio: (audio: HTMLAudioElement, onEnded?: () => void) => void;
  stopAudio: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const handleEnded = useCallback((onEnded?: () => void) => {
    setCurrentAudio(null);
    onEnded?.();
  }, []);

  const playAudio = (audio: HTMLAudioElement, onEnded?: () => void) => {
    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.removeEventListener('ended', () => handleEnded(onEnded));
    }

    setCurrentAudio(audio);

    audio.addEventListener('ended', () => handleEnded(onEnded));

    audio.play().catch((err) => {
      console.error('Error playing audio:', err);
    });
  };

  const stopAudio = () => {
    if (!currentAudio) return;

    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.removeEventListener('ended', () => handleEnded(undefined));

    setCurrentAudio(null);
  };

  return <AudioPlayerContext.Provider value={{ currentAudio, playAudio, stopAudio }}>{children}</AudioPlayerContext.Provider>;
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};
