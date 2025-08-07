import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.tts-providers.$ttsProviderId.ttsVoice.new';
import * as Button from '~/components/ui/button/button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Drawer from '~/components/ui/drawer';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { useTtsProvider } from '~/hooks/queries/ttsQueries';
import { useCreateTtsVoice } from '~/hooks/queries/ttsMutations';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New TTS Voice' }];
}

export default function TtsVoiceNew({ params }: Route.ComponentProps) {
  const { ttsProviderId } = params;
  const { data: ttsProvider } = useTtsProvider(ttsProviderId);
  const { mutate: createTtsVoice, isPending: isCreatingTtsVoice, error: errorCreateTtsVoice } = useCreateTtsVoice();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const jsonData = Object.fromEntries(formData.entries());
    createTtsVoice(jsonData, {
      onSuccess: () => {
        navigate(`/tts-providers/${ttsProviderId}`);
      },
    });
  };

  return (
    <Drawer.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Drawer.Content>
        {ttsProvider ? (
          <>
            <Drawer.Title>Add New TTS Voice for {ttsProvider.name}</Drawer.Title>
            <form onSubmit={handleSubmit} className='size-full flex flex-col'>
              <Drawer.Body className='flex flex-col gap-3'>
                <ErrorsBox errors={errorCreateTtsVoice} />
                <input type='hidden' name='ttsProviderId' value={ttsProvider.id} />

                <Input.Root>
                  <Input.Label id='name' htmlFor='name'>
                    Voice Name
                  </Input.Label>
                  <Input.Input
                    className='text-base-black border border-neutral-04 py-3.5 px-3'
                    id='name'
                    name='name'
                    type='text'
                    placeholder='Voice Name'
                  />
                </Input.Root>

                <Input.Root>
                  <Input.Label id='providerVoiceId' htmlFor='providerVoiceId'>
                    Provider Voice ID
                  </Input.Label>
                  <Input.Input
                    className='text-base-black border border-neutral-04 py-3.5 px-3'
                    id='providerVoiceId'
                    name='providerVoiceId'
                    type='text'
                    placeholder='Provider Voice ID'
                  />
                </Input.Root>

                <div className='flex items-center gap-2'>
                  <Checkbox.Root
                    className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 data-[state=checked]:bg-base-black bg-transparent outline-none focus:shadow-neutral-02'
                    id='recommended'
                    name='recommended'
                  >
                    <Checkbox.Indicator>
                      <Icons.check className='text-white size-4.5' />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label className='text-body-sm font-semibold text-neutral-01' htmlFor='recommended'>
                    Recommended
                  </label>
                </div>
              </Drawer.Body>
              <Drawer.Footer>
                <Dialog.Close asChild>
                  <Button.Root aria-label='Close' className='sm:hidden block w-full'>
                    Close
                  </Button.Root>
                </Dialog.Close>
                <Button.Root type='submit' className='w-full'>
                  Save
                </Button.Root>
              </Drawer.Footer>
            </form>
            <Dialog.Close asChild>
              <button
                className='absolute focus:outline-none -left-[78px] top-4.5 size-10 bg-white rounded-full items-center justify-center z-10 sm:flex hidden'
                aria-label='Close'
                onClick={handleClose}
              >
                <Icons.close className='text-base-black' />
              </button>
            </Dialog.Close>
          </>
        ) : (
          <p>TTS provider not found</p>
        )}
      </Drawer.Content>
    </Drawer.Root>
  );
}
