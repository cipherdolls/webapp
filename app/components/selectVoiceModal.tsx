import * as Dialog from '@radix-ui/react-dialog';
import { Icons } from './ui/icons';
import type { TtsVoice } from '~/types';
import { cn } from '~/utils/cn';
import PlayerButton from './PlayerButton';
import { ANIMATE_MODAL_SHOW_RIGHT, ANIMATE_OVERLAY, PATHS } from '~/constants';
import { useState, useMemo } from 'react';
import * as Select from '~/components/ui/input/select';
import { motion } from 'motion/react';

const genreOptions = [
  {
    value: 'All',
    label: 'All',
  },
  {
    value: 'Male',
    label: 'Male',
  },
  {
    value: 'Female',
    label: 'Female',
  },
];

const SelectVoiceModal = ({
  ttsVoices,
  selectedVoice,
  onVoiceChange,
}: {
  ttsVoices: TtsVoice[];
  selectedVoice: TtsVoice | null;
  onVoiceChange: (voice: TtsVoice) => void;
}) => {
  const [gender, setGender] = useState<string>('All');

  const filteredVoices = useMemo(() => {
    if (gender === 'All' || gender === '') {
      return ttsVoices;
    }
    return ttsVoices.filter((voice) => voice.gender === gender);
  }, [ttsVoices, gender]);
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className='flex items-center gap-2 text-body-sm font-semibold'>
          Change <Icons.chevronRight />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay asChild forceMount>
          <motion.div
            initial={ANIMATE_OVERLAY.initial}
            animate={ANIMATE_OVERLAY.animate}
            transition={ANIMATE_OVERLAY.transition}
            className='bg-neutral-02 fixed inset-0 pointer-events-none z-[1000000]'
          />
        </Dialog.Overlay>

        <Dialog.Content asChild forceMount>
          <motion.div
            initial={ANIMATE_MODAL_SHOW_RIGHT.initial}
            animate={ANIMATE_MODAL_SHOW_RIGHT.animate}
            transition={ANIMATE_MODAL_SHOW_RIGHT.transition}
            className='fixed inset-0 sm:top-2 sm:right-2 sm:bottom-2 sm:left-auto sm:max-w-[408px] w-full bg-white h-auto sm:rounded-xl shadow-bottom-level-2 px-5 overflow-y-auto pb-2 z-[1000000]'
          >
            <div className='flex items-center justify-between'>
              <Dialog.Title className='text-heading-h3 text-base-black py-4 sm:py-[26px] flex items-center'>
                <Dialog.Close className='sm:hidden block'>
                  <Icons.chevronLeft className='mr-3' />
                </Dialog.Close>
                Voice
              </Dialog.Title>
              <Select.Root value={gender} onValueChange={setGender}>
                <Select.Trigger className='max-w-max border-neutral-03 py-2.5 min-w-[110px]'>
                  <Select.Value placeholder='Gender' />
                </Select.Trigger>
                <Select.Content className='z-[1000001]'>
                  {genreOptions.map((item) => (
                    <Select.Item key={item.value} value={item.value}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
                <input type='hidden' name='gender' value={gender} />
              </Select.Root>
            </div>
            <div className='flex flex-col gap-3 '>
              {filteredVoices.length === 0 ? (
                <div className='py-8 text-center'>
                  <p className='text-body-md text-neutral-01'>No voices found for {gender} gender</p>
                </div>
              ) : (
                filteredVoices.map((voice, index) => {
                  const isSelected = selectedVoice?.id === voice.id;
                  return (
                    <button
                      key={index}
                      className={cn(
                        'py-3 px-4 rounded-xl flex items-center gap-4 shadow-regular',
                        isSelected
                          ? gender === 'Male'
                            ? 'male-gradient'
                            : gender === 'Female'
                              ? 'female-gradient'
                              : 'voice-gradient'
                          : 'bg-neutral-05'
                      )}
                      onClick={() => onVoiceChange(voice)}
                    >
                      {/* TODO: FIX CONFLICT WITH BUTTONS */}
                      <PlayerButton variant='white' className='shrink-0 shadow-bottom-level-1' audioSrc={PATHS.ttsVoice(voice.id)} />
                      <div className='flex flex-col gap-1'>
                        <p className='text-body-lg font-semibold text-base-black text-left line-clamp-1'>{voice.name}</p>
                        <span className='text-body-md text-neutral-01 text-left capitalize'>{voice.ttsProvider.name}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <Dialog.Close asChild>
              <button
                className='absolute focus:outline-none -left-12 top-4.5 size-10 bg-white rounded-full flex items-center justify-center'
                aria-label='Close'
              >
                <Icons.close className='text-base-black' />
              </button>
            </Dialog.Close>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SelectVoiceModal;
