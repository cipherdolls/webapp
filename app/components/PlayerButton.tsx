import React, { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Icons } from './ui/icons';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';
import * as Button from '~/components/ui/button/button';
import { cn } from '~/utils/cn';

const RADIUS = 16;
const STROKE = 3;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = RADIUS + STROKE / 2;

type PlayerButtonProps = Omit<ComponentProps<typeof Button.Root>, 'onClick'> & {
  audioSrc: string;
};

const PlayerButton: React.FC<PlayerButtonProps> = ({ audioSrc, className, ...restProps }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const { currentAudio, playAudio, stopAudio } = useAudioPlayer();

  const isPlaying = audioRef.current && audioRef.current === currentAudio;

  //  new audio on audioSrc change
  useEffect(() => {
    const newAudio = new Audio(audioSrc);
    audioRef.current = newAudio;
    return () => {
      newAudio.pause();
    };
  }, [audioSrc]);

  //  updates progress each animation frame
  const handleProgress = () => {
    if (!audioRef.current || !circleRef.current) return;

    const { currentTime, duration } = audioRef.current;
    if (duration > 0) {
      const fraction = currentTime / duration;
      const offset = CIRCUMFERENCE - fraction * CIRCUMFERENCE;
      circleRef.current.style.strokeDashoffset = String(offset);
    }
  };

  // RAF loop
  const step = () => {
    handleProgress();
    rafIdRef.current = requestAnimationFrame(step);
  };

  // Start/stop the loop based on isPlaying
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // start playing
      audioRef.current.play().catch((err) => {
        console.error('Error playing audio:', err);
        stopAudio();
      });
      // off RAF loop
      rafIdRef.current = requestAnimationFrame(step);
    } else {
      // pause/reset the audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      // reset the circle
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE);
      }
      // cancel ongoing RAF
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    }

    // component unmounts or isPlaying changes
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isPlaying, stopAudio]);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent default to stop the button from submitting the form
    e.preventDefault();
    if (!audioRef.current) return;
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio(audioRef.current);
    }
  };

  return (
    <Button.Root
      onClick={handleClick}
      type='button'
      className={cn('relative shrink-0 size-10 rounded-full flex items-center justify-center', className)}
      {...restProps}
    >
      <Button.Icon as={isPlaying ? Icons.stopSound : Icons.sound} className='size-auto' />
      {isPlaying && (
        <>
          <svg
            className='absolute top-1/2 left-1/2 -translate-1/2 transform -rotate-90'
            width={RADIUS * 2 + STROKE}
            height={RADIUS * 2 + STROKE}
          >
            <circle fill='transparent' strokeWidth='1' className='stroke-neutral-04' r={RADIUS} cx={CENTER} cy={CENTER} />
            <circle
              ref={circleRef}
              fill='transparent'
              className='stroke-specials-success '
              strokeLinecap='round'
              strokeWidth={STROKE}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE}
              r={RADIUS}
              cx={CENTER}
              cy={CENTER}
            />
          </svg>
        </>
      )}
    </Button.Root>
  );
};

export default PlayerButton;
