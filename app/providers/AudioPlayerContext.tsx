import React, { createContext, useContext, useState, useCallback } from 'react';

interface AudioPlayerContextType {
  currentAudio: HTMLAudioElement | null;
  playAudio: (audio: HTMLAudioElement) => void;
  stopAudio: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const handleEnded = useCallback(() => {
    setCurrentAudio(null);
  }, []);

  const playAudio = (audio: HTMLAudioElement) => {
    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.removeEventListener('ended', handleEnded);
    }

    setCurrentAudio(audio);

    audio.addEventListener('ended', handleEnded);

    audio.play().catch((err) => {
      console.error('Error playing audio:', err);
    });
  };

  const stopAudio = () => {
    if (!currentAudio) return;

    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.removeEventListener('ended', handleEnded);

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
