import { useRef, useEffect, useCallback } from 'react';
import AvatarPicture from '../AvatarPicture';
import { PICTURE_SIZE } from '~/constants';
import type { Avatar } from '~/types';
import { cn } from '~/utils/cn';
import useAnimationFrame from '~/hooks/useAnimationFrame';
import useAudioData from '~/hooks/useAudioData';


interface AvatarVoiceVisualizerProps {
  isPlaying: boolean;
  avatar: Avatar;
  className?: string;
}

const SMOOTHING_FACTOR = 0.15;
const SCALE_INTENSITY = 0.3;

const AvatarVoiceVisualizer = ({ 
  isPlaying, 
  avatar, 
  className 
}: AvatarVoiceVisualizerProps) => {
  const audioData = useAudioData();
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  
  const updateVisualization = useCallback(() => {
    if (!containerRef.current) return;
    
    let targetScale = 1;
    
    if (audioData.current && audioData.current.length > 0) {
      const data = audioData.current;
      const sampleCount = Math.floor(data.length / 2);
      
      let sum = 0;
      for (let i = 0; i < sampleCount; i++) {
        sum += data[i];
      }
      
      const average = sum / sampleCount;
      targetScale = 1 + (average / 255) * SCALE_INTENSITY;
    }

    // Apply smoothing
    scaleRef.current = scaleRef.current + 
      (targetScale - scaleRef.current) * SMOOTHING_FACTOR;
    
    containerRef.current.style.transform = `scale(${scaleRef.current})`;
  }, []);

  useAnimationFrame(updateVisualization, isPlaying);

  // Reset on play state change
  useEffect(() => {
    if (!isPlaying && containerRef.current) {
      scaleRef.current = 1;
      containerRef.current.style.transform = 'scale(1)';
    }
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className={cn(
        className, 
        'relative flex items-center justify-center',
        'transition-transform duration-75 ease-linear'
      )}
    >
      <AvatarPicture 
        avatar={avatar} 
        sizeType={PICTURE_SIZE.semiMedium} 
        className="size-full" 
      />
    </div>
  );
};

export default AvatarVoiceVisualizer;