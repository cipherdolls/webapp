import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import SignOutFlagIcon from '~/assets/smile/signOut-flag.png';

interface IProps {
  className?: string;
}

export const SignOutModal: React.FC<IProps> = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>Sign Out?</Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className='z-10 fixed inset-0 overflow-y-scroll bg-neutral-02 pointer-events-none' />

          <Dialog.Content className='bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-lg absolute z-50 flex flex-col justify-between items-center focus:outline-none shadow-bottom p-6 pt-8 bottom-0 -translate-x-1/2 left-1/2 w-full h-full rounded-t-xl max-h-[224px] md:md:rounded-xl md:max-h-[282px] md:top-1/2 md:-translate-y-1/2 md:p-8 md:max-w-[480px] '>
            <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />

            <img src={SignOutFlagIcon} alt={'Sign Out Flag Icon'} className='mb-3 w-10 sm:mb-5 sm:w-12 md:w-16' />

            <Dialog.Title className='text-heading-h3 font-semibold mb-5 md:mb-10 lg:text-heading-h2'>Sign Out?</Dialog.Title>

            <div className='w-full flex justify-center mb-2 gap-2 lg:gap-3'>
              <Dialog.Close asChild>
                <button className='w-full text-[16px] font-semibold h-12 text-base-black bg-neutral-04 rounded-full max-w-[186px] transition duration-200 hover:bg-neutral-05 focus:outline-none'>
                  Yes, Sign Out
                </button>
              </Dialog.Close>

              <Dialog.Close asChild>
                <button className='flex items-center justify-center gap-1 w-full text-[16px] font-semibold h-12 text-base-white bg-base-black rounded-full max-w-[186px] transition duration-200 focus:outline-none hover:text-base-white/70'>
                  No, Stay
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
