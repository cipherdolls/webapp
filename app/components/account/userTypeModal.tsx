import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import UserTypeIcon from '~/assets/smile/user-type.png';
import { Icons } from '../ui/icons';

interface IProps {
  className?: string;
}

export const UserTypeInfoModal: React.FC<IProps> = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <Icons.info className='cursor-pointer rounded-full transition duration-300 hover:opacity-75' />
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className='z-10 fixed inset-0 overflow-y-scroll bg-neutral-02 pointer-events-none' />

          <Dialog.Content className='bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-lg absolute z-50 flex flex-col justify-between items-center focus:outline-none shadow-bottom p-6 pt-8 bottom-0 -translate-x-1/2 left-1/2 w-full h-full rounded-t-xl max-h-[332px] sm:rounded-xl sm:max-h-[322px] sm:top-1/2 sm:-translate-y-1/2 sm:p-8 sm:max-w-[480px] '>
            <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />
            <Dialog.Close asChild>
              <div className='absolute -right-14 top-0 p-2 backdrop-blur-sm cursor-pointer bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] rounded-full'>
                <Icons.close />
              </div>
            </Dialog.Close>
            <img src={UserTypeIcon} alt={'User Type Icon'} className='mb-6 w-10 sm:w-16' />

            <Dialog.Title className='text-heading-h3 mb-2 font-semibold md:text-heading-h2'>User Type</Dialog.Title>

            <Dialog.Description className='inline-flex flex-col gap-5 text-body-md mb-5 font-normal text-center max-w-[384px] sm:mb-10 sm:text-body-lg'>
              <p>👌 Consumer - is all you need to chat with avatar and dolls.</p>

              <p>😎 Producer - create your own avatars, public it, see system preferences.</p>
            </Dialog.Description>

            <Dialog.Close asChild className='sm:hidden'>
              <button className='w-full text-[16px] font-semibold h-12 text-base-black bg-neutral-04 rounded-full max-w-[339px] transition duration-200 hover:bg-neutral-05 focus:outline-none'>
                Got It
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
