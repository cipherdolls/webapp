// import { useAudioAnalyzer } from '~/hooks/useAudioAnalyzer';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';
import AvatarPicture from '../AvatarPicture';
import { PICTURE_SIZE } from '~/constants';
import type { Avatar } from '~/types';
import { cn } from '~/utils/cn';
import { useState } from 'react';
import { useEffect } from 'react';

interface AvatarVoiceVisualizerProps {
  audioData: Uint8Array | null;
  isPlaying: boolean;
  avatar: Avatar;
  className?: string;
}

const AvatarVoiceVisualizer = ({ audioData, isPlaying, avatar, className }: AvatarVoiceVisualizerProps) => {
  const [scale, setScale] = useState(1);
  const [avgFrequency, setAvgFrequency] = useState(0);

  useEffect(() => {
    if (!audioData || !isPlaying) {
      // Reset to default state when not playing
      setScale(1);
      return;
    }

    let sum = 0;
    const lowerHalf = audioData.slice(0, audioData.length / 2); // Focus on lower frequencies
    for (let i = 0; i < lowerHalf.length; i++) {
      sum += lowerHalf[i];
    }
    const avg = sum / lowerHalf.length;
    setAvgFrequency(avg);

    // Set scale based on average frequency (with limits)
    const newScale = 1 + (avg / 255) * 0.4; // Reduced scale range from 1 to 1.3
    setScale(newScale);
   
  }, [audioData, isPlaying]);

  return (
    <div
      className={cn(className, 'relative flex items-center justify-center transition-all duration-100')}
      style={{
        transform: `scale(${scale})`,
        animation: isPlaying ? `pulse ${0.5 + (1 - avgFrequency / 255) * 1.5}s infinite alternate ease-in-out` : 'none',
      }}
    >
      <AvatarPicture avatar={avatar} sizeType={PICTURE_SIZE.semiMedium} className="size-full" />
    </div>
  );
};

export default AvatarVoiceVisualizer;
