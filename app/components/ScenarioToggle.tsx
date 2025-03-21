import { useState } from 'react';
import type { Chat } from '~/types';
import { cn } from '~/utils/cn';

const CHAT_MODES = [
  { label: '💅🏻 Easy Talk', value: 'easy' },
  { label: '🧐 Deep Talk', value: 'deep' },
  { label: '🔥 Sexy Talk', value: 'sexy' },
];

const ScenarioToggle = ({ chat, className }: { chat: Chat; className?: string }) => {
  const [activeMode, setActiveMode] = useState<string>(CHAT_MODES[0].value);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
  };

  return (
    <div className={cn('grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-0 sm:bg-neutral-04 rounded-xl p-1', className)}>
      {CHAT_MODES.map(({ label, value }) => (
        <button
          key={value}
          type='button'
          onClick={() => handleModeChange(value)}
          className={cn(
            'flex items-center justify-center h-[48px] sm:w-[110px] md:w-auto sm:h-[40px] text-body-sm font-semibold rounded-xl sm:rounded-[10px] border-4 border-neutral-04 bg-clip-padding bg-neutral-04 sm:bg-transparent sm:border-none',
            activeMode === value && '!bg-base-white shadow-regular'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ScenarioToggle;
