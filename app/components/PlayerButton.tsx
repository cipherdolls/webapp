import React, { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Icons } from './ui/icons';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';
import * as Button from '~/components/ui/button/button';
import { cn } from '~/utils/cn';

type PlayerButtonProps = Omit<ComponentProps<typeof Button.Root>, 'onClick'> & {
  audioSrc: string;
};

const PlayerButton: React.FC<PlayerButtonProps> = ({ audioSrc, className, ...restProps }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0); // 0-100
  const { currentAudio, playAudio, stopAudio } = useAudioPlayer();

  const isPlaying = audioRef && audioRef.current === currentAudio;

  useEffect(() => {
    const newAudio = new Audio(audioSrc);
    audioRef.current = newAudio;

    return () => {
      newAudio.pause();
    };
  }, [audioSrc]);

  // for better progress animation
  useEffect(() => {
    let rafId: number;
    const updateProgress = () => {
      if (audioRef.current && audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
      rafId = requestAnimationFrame(updateProgress);
    };

    if (audioRef.current && currentAudio === audioRef.current) {
      rafId = requestAnimationFrame(updateProgress);
    }

    return () => cancelAnimationFrame(rafId);
  }, [currentAudio]);

  const handleClick = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      stopAudio();
      setProgress(0);
    } else {
      playAudio(audioRef.current);
    }
  };

  const radius = 16;
  const stroke = 3;

  const { circumference, offset, center } = useMemo(() => {
    const normalizedRadius = radius;
    const circleLength = normalizedRadius * 2 * Math.PI;
    const dashOffset = circleLength - (progress / 100) * circleLength;
    const centerPoint = radius + stroke / 2;
    return {
      circumference: circleLength,
      offset: dashOffset,
      center: centerPoint,
    };
  }, [progress, radius, stroke]);

  return (
    <Button.Root
      onClick={handleClick}
      className={cn('relative size-10 rounded-full flex items-center justify-center', className)}
      {...restProps}
    >
      <Button.Icon as={isPlaying ? Icons.stopSound : Icons.sound} />
      {isPlaying && (
        <>
          <svg
            className='absolute top-1/2 left-1/2 -translate-1/2 transform -rotate-90'
            width={radius * 2 + stroke}
            height={radius * 2 + stroke}
          >
            <circle fill='transparent' strokeWidth='1' className='stroke-neutral-04' r={radius} cx={center} cy={center} />
            <circle
              fill='transparent'
              className='stroke-specials-success'
              strokeLinecap='round'
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              style={{ strokeDashoffset: offset }}
              r={radius}
              cx={center}
              cy={center}
            />
          </svg>
        </>
      )}
    </Button.Root>
  );
};

export default PlayerButton;
