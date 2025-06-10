import React, { useEffect, useId, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Icons } from './ui/icons';
import * as Button from '~/components/ui/button/button';
import { cn } from '~/utils/cn';
import { useUnmount } from 'usehooks-ts';
import { useAudioPlayerContext } from 'react-use-audio-player';

const RADIUS = 16;
const STROKE = 3;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = RADIUS + STROKE / 2;

type PlayerButtonProps = Omit<ComponentProps<typeof Button.Root>, 'onClick'> & {
  audioSrc: string;
};

const PlayerButton: React.FC<PlayerButtonProps> = React.memo(({ audioSrc, className, ...restProps }) => {
  const circleRef = useRef<SVGCircleElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const uid = useId();
  const taggedSrc = useMemo(() => `${audioSrc}#${uid}`, [audioSrc, uid]);

  const { isPlaying, load, src, stop, duration, getPosition } = useAudioPlayerContext();

  const isThisPlaying = isPlaying && src === taggedSrc;

  /* ---------------- progress ---------------- */
  useEffect(() => {
    if (!isThisPlaying) {
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE);
      }
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      return;
    }

    const step = () => {
      const pos = getPosition();
      const frac = duration ? pos / duration : 0;
      const offset = CIRCUMFERENCE - frac * CIRCUMFERENCE;

      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(offset);
      }
      rafIdRef.current = requestAnimationFrame(step);
    };

    rafIdRef.current = requestAnimationFrame(step);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isThisPlaying, duration, getPosition]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isThisPlaying) {
      stop();
      return;
    }
    load(taggedSrc, {
      initialVolume: 1,
      autoplay: true,
      format: 'mp3',
    });
  };

  useUnmount(() => {
    stop();
  });

  return (
    <Button.Root
      onClick={handleClick}
      type='button'
      className={cn('relative shrink-0 size-10 rounded-full flex items-center justify-center', className)}
      {...restProps}
    >
      <Button.Icon as={isThisPlaying ? Icons.stopSound : Icons.sound} className='size-auto' />

      {isThisPlaying && (
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
});

export default PlayerButton;
