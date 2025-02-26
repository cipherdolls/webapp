import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import SignOutFlagIcon from '~/assets/smile/signOut-flag.png';

interface IProps {
  isSignOutOpen: boolean;
  setIsSignOutOpen: (open: boolean) => void;
  className?: string;
}

export const SignOutModal: React.FC<IProps> = ({ isSignOutOpen, setIsSignOutOpen }) => {
  return (
    <>
      <Dialog.Root open={isSignOutOpen} onOpenChange={setIsSignOutOpen}>
        <Dialog.Trigger asChild>Sign Out?</Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className='sm:bg-transparent bg-neutral-02 fixed inset-0 pointer-events-none'>
            <div
              className='absolute left-1/2 -translate-x-1/2
        w-[375px] h-[514px] sm:w-[480px] sm:h-[282px]
        bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
        rounded-xl pointer-events-none sm:block hidden'
            />

            <div
              className='absolute inset-0 bg-gradient-to-b from-neutral-02 to-neutral-02 sm:block hidden
        [mask-image:linear-gradient(to_bottom,black_0%,black_100%),linear-gradient(to_right,black_0%,black_100%)]
        [mask-size:100%_100%,480px_282px]
        [mask-position:0_0,50%_50%]
        [mask-repeat:no-repeat]
        [mask-composite:exclude]'
              style={{
                maskImage:
                  "linear-gradient(to bottom, black 0%, black 100%), url(\"data:image/svg+xml,%3Csvg width='480' height='530' viewBox='0 0 480 530' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='480' height='530' rx='12' fill='black'/%3E%3C/svg%3E\")",
              }}
            />
          </Dialog.Overlay>

          <Dialog.Content className='bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] z-20 backdrop-blur-lg absolute flex flex-col justify-between items-center focus:outline-none p-6 pt-8 shadow-bottom bottom-0 -translate-x-1/2 left-1/2 w-full h-full rounded-t-xl max-h-[224px] sm:rounded-xl sm:max-h-[282px] sm:top-1/2 sm:-translate-y-1/2 sm:p-8 sm:max-w-[480px] '>
            <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />

            <img src={SignOutFlagIcon} alt={'Sign Out Flag Icon'} className='mb-3 w-10 sm:mb-5 sm:w-16' />

            <Dialog.Title className='text-heading-h3 font-semibold mb-5 sm:mb-10 sm:text-heading-h2'>Sign Out?</Dialog.Title>

            <div className='w-full flex justify-center mb-2 gap-2 md:gap-3'>
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
