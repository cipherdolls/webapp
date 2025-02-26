import React, { type ComponentProps } from 'react';
import { Icons } from './ui/icons';

interface PlayerButtonProps extends ComponentProps<"button"> {
  progress: number;
  isPlaying: boolean;
  isLoading: boolean;
}


// TODO: Add isLoading state

const PlayerButton: React.FC<PlayerButtonProps> = ({ progress, isPlaying, isLoading, onClick }) => {
  const radius = 16;
  const stroke = 3;
  const normalizedRadius = radius;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const center = radius + stroke / 2;

  return (
    <button onClick={onClick} className='relative w-10 h-10 rounded-full bg-neutral-04 flex items-center justify-center'>
      <div className='absolute top-1/2 left-1/2 -translate-1/2 rounded-full w-8 h-8 '></div>
      {isPlaying ? (
        <>
          <svg
            className='absolute top-1/2 left-1/2 -translate-1/2 transform -rotate-90'
            width={radius * 2 + stroke}
            height={radius * 2 + stroke}
          >
            <circle fill='transparent' strokeWidth='1' className='stroke-neutral-04' r={radius} cx={center} cy={center} />
            <circle
              stroke='#03cc9c'
              fill='transparent'
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
          <Icons.stopSound />
        </>
      ) : (
        <Icons.sound />
      )}
    </button>
  );
};

export default PlayerButton;
