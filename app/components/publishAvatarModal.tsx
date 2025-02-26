import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import * as Button from '~/components/ui/button';

interface PublishAvatarModalProps {
  onConfirm: () => void;
  children: ReactNode;
}

const PublishAvatarModal = ({ onConfirm, children }: PublishAvatarModalProps) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='sm:bg-transparent bg-neutral-02 fixed inset-0 pointer-events-none'>
          <div
            className='absolute left-1/2 -translate-x-1/2
        w-[375px] h-[514px] sm:w-[480px] sm:h-[338px] 
        bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
        rounded-xl pointer-events-none sm:block hidden'
          />
          <div
            className='absolute inset-0 bg-gradient-to-b from-neutral-02 to-neutral-02 sm:block hidden
        [mask-image:linear-gradient(to_bottom,black_0%,black_100%),linear-gradient(to_right,black_0%,black_100%)] 
        [mask-size:100%_100%,480px_338px] 
        [mask-position:0_0,50%_50%] 
        [mask-repeat:no-repeat] 
        [mask-composite:exclude]'
            style={{
              maskImage:
                "linear-gradient(to bottom, black 0%, black 100%), url(\"data:image/svg+xml,%3Csvg width='480' height='338' viewBox='0 0 480 338' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='480' height='338' rx='12' fill='black'/%3E%3C/svg%3E\")",
            }}
          />
        </Dialog.Overlay>

        <Dialog.Content className='fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] w-full rounded-xl sm:py-8 py-9 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-20'>
          <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />
          <div className='flex flex-col gap-10'>
            <div className='flex flex-col gap-4.5 items-center justify-center'>
              <h1 className='text-heading-h2 sm:text-heading-h1'>🌐</h1>
              <div className='flex flex-col gap-2'>
                <h2 className='sm:text-heading-h2 text-heading-h3 text-base-black text-center'>Publish an Avatar?</h2>
                <p className='sm:text-body-lg text-base-black text-body-md text-center'>
                  Once published, you will no longer be able to edit or delete your avatar
                </p>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <Dialog.Close asChild>
                <Button.Root type='button' variant='secondary' onClick={onConfirm}>
                  Yes, Continue
                </Button.Root>
              </Dialog.Close>
              <Dialog.Close asChild>
                <Button.Root type='button'>Yes, Continue</Button.Root>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PublishAvatarModal;
