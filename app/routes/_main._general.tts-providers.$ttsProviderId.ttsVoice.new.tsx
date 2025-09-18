import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.tts-providers.$ttsProviderId.ttsVoice.new';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
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
    navigate(`/tts-providers/${ttsProviderId}`, { replace: true });
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
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content>
        {ttsProvider ? (
          <>
            <Modal.Title>Add New TTS Voice for {ttsProvider.name}</Modal.Title>
            <Modal.Description className='sr-only'>Add New TTS Voice for {ttsProvider.name}</Modal.Description>
            <form onSubmit={handleSubmit} className='w-full flex flex-col mt-[18px]'>
              <Modal.Body className='flex flex-col gap-5'>
                <ErrorsBox errors={errorCreateTtsVoice} />
                <input type='hidden' name='ttsProviderId' value={ttsProvider.id} />

                <Input.Root>
                  <Input.Label id='name' htmlFor='name'>
                    Voice Name
                  </Input.Label>
                  <Input.Input
                    className='text-base-black py-3.5 px-3'
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
                    className='text-base-black py-3.5 px-3'
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
              </Modal.Body>
              <Modal.Footer>
                <Modal.Close asChild>
                  <Button.Root variant='secondary' aria-label='Close' className='w-full'>
                    Cancel
                  </Button.Root>
                </Modal.Close>
                <Button.Root type='submit' className='w-full'>
                  Save
                </Button.Root>
              </Modal.Footer>
            </form>
          </>
        ) : (
          <p>TTS provider not found</p>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
