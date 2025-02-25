import * as Dialog from '@radix-ui/react-dialog';
import { Icons } from './ui/icons';
import type { TtsVoice } from '~/types';
import { cn } from '~/utils/cn';

const SelectVoiceModal = ({
  ttsVoices,
  selectedVoice,
  onVoiceChange,
}: {
  ttsVoices: TtsVoice[];
  selectedVoice: TtsVoice | null;
  onVoiceChange: (voice: TtsVoice) => void;
}) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className='flex items-center gap-2 text-body-sm font-semibold'>
          Change <Icons.chevronRight />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='bg-neutral-02 fixed inset-0 pointer-events-none' />

        <Dialog.Content className='fixed inset-0 sm:top-2 sm:right-2 sm:bottom-2 sm:left-auto sm:max-w-[408px] w-full bg-white h-auto sm:rounded-xl shadow-bottom-level-2 px-5 overflow-y-auto pb-2'>
          <Dialog.Title className='text-heading-h3 text-base-black py-4 sm:py-[26px] flex items-center'>
            <Dialog.Close className='sm:hidden block'>
              <Icons.chevronLeft className='mr-3' />
            </Dialog.Close>
            Voice
          </Dialog.Title>
          <div className='flex flex-col gap-3 '>
            {ttsVoices.map((voice, index) => {
              const isSelected = selectedVoice?.id === voice.id;
              return (
                <button
                  key={index}
                  className={cn(
                    'py-3 px-4 rounded-xl flex items-center gap-4 shadow-regular',
                    isSelected ? 'voice-gradient' : 'bg-neutral-05'
                  )}
                  onClick={() => onVoiceChange(voice)}
                >
                  {/* TODO: isPlaying state on sound icon */}
                  <div className='size-10 rounded-full shadow-bottom-level-1 flex items-center justify-center bg-base-white'>
                    <Icons.sound />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <p className='text-body-lg font-semibold text-base-black text-left line-clamp-1'>{voice.name}</p>
                    <span className='text-body-md text-neutral-01 text-left'>Unrealspeach</span>
                  </div>
                </button>
              );
            })}
          </div>
          <Dialog.Close asChild>
            <button
              className='absolute focus:outline-none -left-12 top-4.5 size-10 bg-white rounded-full flex items-center justify-center'
              aria-label='Close'
            >
              <Icons.close />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SelectVoiceModal;
