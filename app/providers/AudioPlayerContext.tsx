import React, { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from 'react';

/* ---------- types ---------- */
interface AudioPlayerContextType {
  currentAudio: HTMLAudioElement | null;
  currentSrc: string | null;
  isPlaying: boolean;
  unlocked: boolean;
  unlockAudio: () => Promise<void>;
  playAudio: (url: string, onEnded?: () => void) => void;
  stopAudio: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

/* ---------- provider ---------- */
export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  /* state that affects re-rendering */
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  /* -------------------------------------------------------------- */
  /*  helper: clear state                                           */
  /* -------------------------------------------------------------- */
  const clearState = useCallback(() => {
    setIsPlaying(false);
    setCurrentSrc(null);
  }, []);


  /* -------------------------------------------------------------- */
  /*  unlock audio                                                        */
  /* -------------------------------------------------------------- */
  const unlockAudio = useCallback(async () => {
    if (unlocked) return;
    const SILENT_WAV = 'data:audio/wav;base64,UklGRl4RAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToRAAAAAAAAAAAA';
    try {
      audioRef.current.src = SILENT_WAV;
      await audioRef.current.play().catch((e) => {
        if (e.name !== 'AbortError') throw e;
      });
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setUnlocked(true);
    } catch (err) {
      console.warn('unlock failed', err);
    }
  }, [unlocked]);

  /* -------------------------------------------------------------- */
  /*  playAudio                                                     */
  /* -------------------------------------------------------------- */
  const playAudio = useCallback(
    (url: string, onEnded?: () => void) => {
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = 0;

      audio.src = url;
      audio.onended = () => {
        clearState();
        onEnded?.();
      };
      audio.onerror = (error) => {
        console.error('error', error);
        clearState();
        onEnded?.();
      };

      audio
        .play()
        .then(() => {
          setCurrentSrc(url);
          setIsPlaying(true);
        })
        .catch(console.error);
    },
    [clearState]
  );

  /* -------------------------------------------------------------- */
  /*  stopAudio                                                     */
  /* -------------------------------------------------------------- */
  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    clearState();
  }, [clearState]);

  /* -------------------------------------------------------------- */
  /*  react to pause/ended if triggered outside our code            */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    const audio = audioRef.current;
    const handlePause = clearState;
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);
    return () => {
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  }, [clearState]);

  const contextValue = useMemo(
    () => ({
      currentAudio: audioRef.current,
      currentSrc,
      isPlaying,
      unlocked,
      unlockAudio,
      playAudio,
      stopAudio,
    }),
    [currentSrc, isPlaying, unlocked] 
  );
  

  return (
    <AudioPlayerContext.Provider
      value={contextValue}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

/* ---------- hook ---------- */
export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used inside AudioPlayerProvider');
  return ctx;
};
