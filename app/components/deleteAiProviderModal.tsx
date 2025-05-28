import * as Dialog from '@radix-ui/react-dialog';
import { Icons } from './ui/icons';
import * as Button from '~/components/ui/button/button';
import AiProviderDestroy from '~/routes/ai-providers.$id.destroy';

const DeleteAiProviderModal = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button.Root type='button' variant='danger'>
          <Icons.trash className='w-12' />
        </Button.Root>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='bg-neutral-02 fixed inset-0 pointer-events-none'></Dialog.Overlay>

        <Dialog.Content className='fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-gradient-1 w-full rounded-xl sm:py-8 py-9 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-20'>
          <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />
          <div className='flex flex-col gap-10'>
            <div className='flex flex-col gap-4.5 items-center justify-center'>
              <h1 className='text-heading-h2 sm:text-heading-h1'>🗑️</h1>
              <div className='flex flex-col gap-2'>
                <h2 className='sm:text-heading-h2 text-heading-h3 text-base-black text-center'>Delete an AI Provider?</h2>
                <p className='sm:text-body-lg text-base-black text-body-md text-center'>
                  By deleting an AI Provider all of your data will be deleted as well. You will no able to restore the data
                </p>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <AiProviderDestroy />
              <Dialog.Close asChild>
                <Button.Root className='w-full'>No, Leave</Button.Root>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DeleteAiProviderModal;
