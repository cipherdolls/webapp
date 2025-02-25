import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import ApiKeyIcon from '~/assets/smile/api-key.png';
import { cn } from '~/utils/cn';
import { Icons } from '../ui/icons';

interface IProps {
  isCopied: boolean;
  setIsCopied: (copied: boolean) => void;
  className?: string;
}

export const ApiKeyModal: React.FC<IProps> = ({ isCopied, setIsCopied }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClickCopied = () => {
    setIsCopied(true);

    setTimeout(() => {
      setIsOpen(false);
      setIsCopied(false);
    }, 900);
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <Icons.info className='cursor-pointer rounded-full transition duration-300 hover:opacity-75' />
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className='z-10 fixed inset-0 overflow-y-scroll bg-neutral-02 pointer-events-none' />

          <Dialog.Content className='bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-lg absolute z-50 flex flex-col justify-between items-center focus:outline-none shadow-bottom p-6 pt-8 bottom-0 -translate-x-1/2 left-1/2 w-full h-full rounded-t-xl max-h-[310px] sm:rounded-xl sm:max-h-[362px] sm:top-1/2 sm:-translate-y-1/2 sm:p-8 sm:max-w-[480px] '>
            <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />

            <img src={ApiKeyIcon} alt={'Api Key Icon'} className='mb-6 w-10 sm:w-16' />

            <Dialog.Title className='text-heading-h3 mb-2 font-semibold md:text-heading-h2'>API Key</Dialog.Title>

            <Dialog.Description className='text-body-md mb-5 font-normal text-center max-w-[384px] sm:mb-10 sm:text-body-lg'>
              Use the API Key - <br />
              <span className='font-semibold underline'>25a7830a-0d09-4b48-8d1b-f7b39e2ca75e...</span> <br />
              to connect a doll.
            </Dialog.Description>

            <div className='w-full flex justify-center mb-2 gap-2 lg:gap-3'>
              <Dialog.Close asChild>
                <button className='w-full text-[16px] font-semibold h-12 text-base-black bg-neutral-04 rounded-full max-w-[186px] transition duration-200 hover:bg-neutral-05 focus:outline-none'>
                  Got It
                </button>
              </Dialog.Close>

              <button
                onClick={handleClickCopied}
                className={cn(
                  'flex items-center justify-center gap-1 w-full text-[16px] font-semibold h-12 text-base-white bg-base-black rounded-full max-w-[186px] transition duration-200 focus:outline-none',
                  isCopied && 'bg-base-black/0'
                )}
              >
                {isCopied ? (
                  <>
                    <Icons.copied /> <span className='text-base-black'>Copied</span>
                  </>
                ) : (
                  <span className='text-base-white'>Copy Address</span>
                )}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
