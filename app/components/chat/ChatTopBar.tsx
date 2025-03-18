import { Link } from 'react-router';
import { PATHS, PICTURE_SIZE } from '~/constants';
import type { Chat } from '~/types';
import { cn } from '~/utils/cn';
import { useState } from 'react';
import PlayerButton from '../PlayerButton';
import { Icons } from '../ui/icons';
import AvatarPicture from '../AvatarPicture';
import { Modal } from '~/components/ui/Modal';

interface ChatTopBarProps {
  chat: Chat;
}

const ChatTopBar: React.FC<ChatTopBarProps> = ({ chat }) => {
  const [activeMode, setActiveMode] = useState<string>(CHAT_MODES[0].value);

  const onModeChange = (mode: string) => {
    setActiveMode(mode);
  };

  return (
    <div className='flex items-center justify-between px-5 py-3.5 lg:border-b lg:border-neutral-04 lg:bg-white'>
      <div className='flex gap-3 items-center w-full sm:w-auto'>
        <Link to={`/chats/`} className='shrink-0 text-base-black lg:hidden'>
          <Icons.chevronLeft />
        </Link>
        <Link to={`/chats/${chat.id}/edit`} className='inline-flex items-center gap-4'>
          <AvatarPicture avatar={chat.avatar} sizeType={PICTURE_SIZE.semiMedium} className='size-10 shrink-0' />
        </Link>
        <div className='flex-1 mr-auto sm:mr-0'>
          <h3 className='text-body-md sm:text-heading-h3 font-semibold leading-[1.2em] truncate'>{chat.avatar.name}</h3>
          <div className='sm:hidden'>
            <Modal.Root>
              <Modal.Trigger className='flex whitespace-nowrap'>
                {chat.scenario.name} <Icons.chevronDown />
              </Modal.Trigger>
              <Modal.Content title='Avatars'>
                <ChatModeToggle currentMode={activeMode} onModeChange={onModeChange} />
              </Modal.Content>
            </Modal.Root>
          </div>
        </div>

        <PlayerButton audioSrc={PATHS.ttsVoice(chat.avatar.ttsVoiceId)} variant='ghost' />
        <button className='md:hidden'>
          <Icons.info className='size-6 text-base-black' />
        </button>
      </div>
      {/* <ChatDestroy /> */}
      <ChatModeToggle currentMode={activeMode} onModeChange={onModeChange} className='max-sm:hidden' />
    </div>
  );
};

export default ChatTopBar;

// TODO: add logic for changing mode
// CHAT MODE TOGGLE

const CHAT_MODES = [
  { label: '💅🏻 Easy Talk', value: 'easy' },
  { label: '🧐 Deep Talk', value: 'deep' },
  { label: '🔥 Sexy Talk', value: 'sexy' },
];

const ChatModeToggle = ({
  className,
  currentMode,
  onModeChange,
}: {
  className?: string;
  currentMode: string;
  onModeChange?: (mode: string) => void;
}) => {
  return (
    <div className={cn('grid grid-cols-2  gap-1 sm:flex sm:gap-0 sm:bg-neutral-04 rounded-xl p-1', className)}>
      {CHAT_MODES.map(({ label, value }) => (
        <button
          key={value}
          type='button'
          onClick={() => onModeChange?.(value)}
          className={cn(
            'flex items-center justify-center h-[48px] sm:w-[110px] md::w-[120px] sm:h-[40px] text-body-sm font-semibold rounded-xl sm:rounded-[10px] border-4 border-neutral-04 bg-clip-padding bg-neutral-04 sm:bg-transparent sm:border-none',
            currentMode === value && '!bg-base-white shadow-regular'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
