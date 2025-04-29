import React, { useEffect, useRef, useState, type ComponentProps } from 'react';
import { Icons } from './ui/icons';
import * as Button from '~/components/ui/button/button';
import { cn } from '~/utils/cn';
import { useAudioPlayer } from '~/providers/AudioPlayerContext';
import { useUnmount } from 'usehooks-ts';

const RADIUS = 16;
const STROKE = 3;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = RADIUS + STROKE / 2;

type PlayerButtonProps = Omit<ComponentProps<typeof Button.Root>, 'onClick'> & {
  audioSrc: string;
};

const PlayerButton: React.FC<PlayerButtonProps> = ({ audioSrc, className, ...restProps }) => {
  const circleRef = useRef<SVGCircleElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const { currentAudio, currentSrc, playAudio, stopAudio } = useAudioPlayer();

  const isPlaying = currentSrc === audioSrc;

  /* ---------------- progress ---------------- */
  useEffect(() => {
    if (!isPlaying) {
      /* if track stopped - reset circle */
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE);
      }
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      return;
    }

    /* RAF-cycle for progress updates */
    const step = () => {
      if (currentAudio && circleRef.current && currentAudio.duration > 0) {
        const fraction = currentAudio.currentTime / currentAudio.duration;
        const offset = CIRCUMFERENCE - fraction * CIRCUMFERENCE;
        circleRef.current.style.strokeDashoffset = String(offset);
      }
      rafIdRef.current = requestAnimationFrame(step);
    };

    step(); 
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isPlaying, currentAudio]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    isPlaying ? stopAudio() : playAudio(audioSrc);
  };

  useUnmount(() => {
    stopAudio();
  });

  return (
    <Button.Root
      onClick={handleClick}
      type='button'
      className={cn('relative shrink-0 size-10 rounded-full flex items-center justify-center', className)}
      {...restProps}
    >
      <Button.Icon as={isPlaying ? Icons.stopSound : Icons.sound} className='size-auto' />

      {isPlaying && (
        <svg className='absolute top-1/2 left-1/2 -translate-1/2 -rotate-90' width={RADIUS * 2 + STROKE} height={RADIUS * 2 + STROKE}>
          <circle fill='transparent' strokeWidth='1' className='stroke-neutral-04' r={RADIUS} cx={CENTER} cy={CENTER} />
          <circle
            ref={circleRef}
            fill='transparent'
            className='stroke-specials-success'
            strokeLinecap='round'
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            r={RADIUS}
            cx={CENTER}
            cy={CENTER}
          />
        </svg>
      )}
    </Button.Root>
  );
};

export default PlayerButton;
