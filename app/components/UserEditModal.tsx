import * as Dialog from '@radix-ui/react-dialog';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import type { Gender, User } from '~/types';
import { useEffect, useState } from 'react';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { cn } from '~/utils/cn';
import { useUpdateUser } from '~/hooks/queries/userMutations';
import * as Select from '~/components/ui/input/select';
import { ANIMATE_DURATION, ANIMATE_MODAL_SHOW_CENTER, ANIMATE_OVERLAY, LANGUAGES } from '~/constants';
import { motion } from 'framer-motion';

interface UserEditModalProps {
  me: User;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const UserEditModal = ({ me, open, onOpenChange }: UserEditModalProps) => {
  const updateUserMutation = useUpdateUser();
  const [internalOpen, setInternalOpen] = useState(false);
  const [gender, setGender] = useState<Gender | null>(me.gender || null);
  const [preferLanguage, setPreferLanguage] = useState<string>(me.language);

  const isControlled = open !== undefined;
  const openState = isControlled ? open : internalOpen;
  const setOpenState = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

  useEffect(() => {
    if (updateUserMutation.isSuccess && !updateUserMutation.error) {
      setOpenState(false);
    }
  }, [updateUserMutation.isSuccess, updateUserMutation.error, setOpenState]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const data = Object.fromEntries(formData.entries());

    const updateData = {
      userId: me.id,
      signerAddress: me.signerAddress,
      name: data.name,
      character: data.character,
      gender: gender,
      language: preferLanguage,
    };

    updateUserMutation.mutate(updateData);
  };

  return (
    <Dialog.Root open={openState} onOpenChange={setOpenState}>
      <Dialog.Portal>
        <Dialog.Overlay asChild forceMount className='animate-overlay-show sm:bg-transparent bg-neutral-02 fixed inset-0 pointer-events-none z-20'>
          <motion.div
            initial={ANIMATE_OVERLAY.initial}
            animate={ANIMATE_OVERLAY.animate}
            transition={ANIMATE_OVERLAY.transition}
          >
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
          </motion.div>
        </Dialog.Overlay>

        <Dialog.Content asChild forceMount data-testid='user-edit-modal'>
          <motion.div
            initial={ANIMATE_MODAL_SHOW_CENTER.initial}
            animate={ANIMATE_MODAL_SHOW_CENTER.animate}
            transition={ANIMATE_MODAL_SHOW_CENTER.transition}
            className='animate-modal-show fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-gradient-1 w-full rounded-xl sm:py-8 py-9 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-20 max-h-[80vh] overflow-y-auto'
          >
            <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />
            <div className='flex flex-col sm:gap-4.5 gap-3'>
              <div className='sm:text-heading-h1 text-heading-h2 text-center'>✏️</div>
              <div className='flex flex-col gap-2'>
                <Dialog.Title className='sm:text-heading-h2 text-heading-h3 text-base-black text-center'>Edit Your Info</Dialog.Title>
                <Dialog.Description className='sm:text-center sm:text-body-lg text-body-md text-neutral-01'>
                  Update your name and character description
                </Dialog.Description>
              </div>

              <form role='form' onSubmit={handleSubmit} className='sm:mt-[22px] mt-4.5'>
                <div className='flex flex-col gap-4'>
                  {updateUserMutation.error && <ErrorsBox errors={[updateUserMutation.error.message]} className='mb-2' />}

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
                    <Input.Label htmlFor='preferLanguage'>Language for speaking</Input.Label>
                    <Select.Root
                      name='preferLanguage'
                      defaultValue={preferLanguage.toLowerCase()}
                      onValueChange={(value) => setPreferLanguage(value)}
                    >
                      <Select.Trigger
                        id='preferLanguage'
                        className='bg-gradient-1 border border-neutral-04 data-[state=open]:!bg-neutral-05 data-[state=open]:!outline data-[state=open]:!outline-neutral-05 transition-colors'
                      >
                        <Select.Value placeholder='Select prefer language for speaking' />
                      </Select.Trigger>

                      <Select.Content className='overflow-y-hidden max-h-[28vh]'>
                        {LANGUAGES.map((lang) => (
                          <Select.Item key={lang.code} value={lang.code}>
                            <span className='font-medium'>{lang.code.toUpperCase()}</span>{' '}
                            <span className='text-neutral-01'>- ({lang.name})</span>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    <p className='text-xs text-gray-500'>Select your prefer language for chatting and speaking.</p>
                  </Input.Root>

                  <Input.Root>
                    <Input.Label htmlFor='gender'>Gender</Input.Label>
                    <div className='relative p-1 bg-neutral-05 grid grid-cols-2 rounded-xl'>
                      <button
                        type='button'
                        className='relative z-10 flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors'
                        onClick={() => setGender('Female')}
                      >
                        👩🏻 Female
                      </button>
                      <button
                        type='button'
                        className='relative z-10 flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors'
                        onClick={() => setGender('Male')}
                      >
                        🧔🏻‍♂ Male
                      </button>

                      <motion.div
                        layout
                        transition={ANIMATE_DURATION}
                        className={cn(
                          'absolute top-1 w-1/2 max-w-[188px] h-10 bg-white rounded-xl',
                          gender === 'Female' ? 'left-1' : 'right-1'
                        )}
                      />
                    </div>
                    <input type='hidden' name='gender' value={gender || ''} />
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
                    <Button.Root type='submit' disabled={updateUserMutation.isPending}>
                      {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button.Root>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UserEditModal;
