import * as Dialog from '@radix-ui/react-dialog';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import { type FetcherWithComponents } from 'react-router';
import type { User } from '~/types';
import { useEffect, useState } from 'react';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { cn } from '~/utils/cn';

interface UserEditModalProps {
  me: User;
  fetcher: FetcherWithComponents<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const UserEditModal = ({ me, fetcher, open, onOpenChange }: UserEditModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');

  const isControlled = open !== undefined;
  const openState = isControlled ? open : internalOpen;
  const setOpenState = isControlled ? onOpenChange! : setInternalOpen;

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && !fetcher.data?.message) {
      setOpenState(false);
    }
  }, [fetcher.state, fetcher.data, setOpenState]);

  return (
    <Dialog.Root open={openState} onOpenChange={setOpenState}>
      <Dialog.Portal>
        <Dialog.Overlay className='sm:bg-transparent bg-neutral-02 fixed inset-0 pointer-events-none z-20'>
          <div
            className='absolute left-1/2 -translate-x-1/2
        w-[375px] h-auto sm:w-[480px] sm:h-auto 
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
          />
        </Dialog.Overlay>

        <Dialog.Content className='fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-gradient-1 w-full rounded-xl sm:py-8 py-9 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-20 max-h-[80vh] overflow-y-auto'>
          <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />
          <div className='flex flex-col sm:gap-4.5 gap-3'>
            <div className='sm:text-heading-h1 text-heading-h2 text-center'>✏️</div>
            <div className='flex flex-col gap-2'>
              <Dialog.Title className='sm:text-heading-h2 text-heading-h3 text-base-black text-center'>Edit Your Info</Dialog.Title>
              <Dialog.Description className='sm:text-center sm:text-body-lg text-body-md text-neutral-01'>
                Update your name and character description
              </Dialog.Description>
            </div>

            <fetcher.Form method='PATCH' className='sm:mt-[22px] mt-4.5'>
              <input name='userId' value={me.id} hidden readOnly />
              <input name='signerAddress' value={me.signerAddress} hidden readOnly />

              <div className='flex flex-col gap-4'>
                {fetcher.data?.message && <ErrorsBox errors={fetcher.data.message} className='mb-2' />}

                <Input.Root>
                  <Input.Label id='name' htmlFor='name'>
                    Name
                  </Input.Label>
                  <Input.Input
                    className='text-base-black py-3.5 px-3'
                    id='name'
                    name='name'
                    type='text'
                    placeholder='Felix'
                    defaultValue={me.name}
                  />
                </Input.Root>

                <Input.Root>
                  <Input.Label htmlFor='gender'>Gender</Input.Label>
                  <div className='p-1 bg-neutral-05 grid grid-cols-2 rounded-xl'>
                    <button
                      type='button'
                      className={cn(
                        'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                        gender === 'Female' ? 'bg-white' : 'bg-transparent'
                      )}
                      onClick={() => setGender('Female')}
                    >
                      👩🏻 Female
                    </button>
                    <button
                      type='button'
                      className={cn(
                        'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                        gender === 'Male' ? 'bg-white' : 'bg-transparent'
                      )}
                      onClick={() => setGender('Male')}
                    >
                      🧔🏻‍♂ Male
                    </button>
                  </div>
                  <input type='hidden' name='gender' value={gender} />
                </Input.Root>

                <Textarea.Root>
                  <Textarea.Label htmlFor='character'>Character</Textarea.Label>
                  <Textarea.Wrapper>
                    <Textarea.Textarea
                      className='scrollbar-medium text-base-black min-h-24'
                      id='character'
                      name='character'
                      placeholder='Describe your avatar'
                      defaultValue={me.character}
                    />
                  </Textarea.Wrapper>
                </Textarea.Root>

                <div className='grid grid-cols-2 gap-2 mt-4'>
                  <Dialog.Close asChild>
                    <Button.Root type='button' variant='secondary'>
                      Cancel
                    </Button.Root>
                  </Dialog.Close>
                  <Button.Root type='submit' disabled={fetcher.state === 'submitting'}>
                    {fetcher.state === 'submitting' ? 'Saving...' : 'Save Changes'}
                  </Button.Root>
                </div>
              </div>
            </fetcher.Form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UserEditModal;
