import { useNavigate } from 'react-router';

import type { Route } from './+types/_main._general.tts-providers.$ttsProviderId.ttsVoice.$ttsVoiceId.edit';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { useTtsVoice } from '~/hooks/queries/ttsQueries';
import { useUpdateTtsVoice } from '~/hooks/queries/ttsMutations';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New TTS Voice' }];
}

export default function TtsVoiceEdit({ params }: Route.ComponentProps) {
  const { ttsVoiceId } = params;
  const { data: ttsVoice, isLoading: isLoadingTtsVoice } = useTtsVoice(ttsVoiceId);
  const { mutate: updateTtsVoice, isPending: isUpdatingTtsVoice, error: errorUpdateTtsVoice } = useUpdateTtsVoice();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/tts-providers/${params.ttsProviderId}`, { replace: true });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const jsonData = Object.fromEntries(formData.entries());
    updateTtsVoice({ ttsVoiceId, jsonData }, {
      onSuccess: handleClose,
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
        {ttsVoice ? (
          <>
            <Modal.Title>Edit {ttsVoice.name}</Modal.Title>
            <Modal.Description className='sr-only'>Edit {ttsVoice.name}</Modal.Description>
            <form onSubmit={handleSubmit} className='w-full flex flex-col mt-[18px]'>
              <Modal.Body className='flex flex-col gap-5'>
                <ErrorsBox errors={errorUpdateTtsVoice} />
                <input type='hidden' name='ttsVoiceId' value={ttsVoice.id} />

                <Input.Root>
                  <Input.Label id='name' htmlFor='name'>
                    Voice Name
                  </Input.Label>
                  <Input.Input
                    className='text-base-black py-3.5 px-3'
                    id='name'
                    name='name'
                    type='text'
                    defaultValue={ttsVoice.name}
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
                    defaultValue={ttsVoice.providerVoiceId}
                  />
                </Input.Root>

                <div className='flex items-center gap-2'>
                  <Checkbox.Root
                    className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 data-[state=checked]:bg-base-black bg-transparent outline-none focus:shadow-neutral-02'
                    id='recommended'
                    name='recommended'
                    defaultChecked={ttsVoice.recommended}
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
          <p>TTS voice not found</p>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
