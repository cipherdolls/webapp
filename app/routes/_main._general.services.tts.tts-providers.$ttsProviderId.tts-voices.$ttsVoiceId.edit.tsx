import { useNavigate } from 'react-router';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
import type { Route } from './+types/_main._general.services.tts.tts-providers.$ttsProviderId.tts-voices.$ttsVoiceId.edit';
import ErrorsBox from '~/components/ui/input/errorsBox';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Icons } from '~/components/ui/icons';
import { useEffect, useState } from 'react';
import * as Select from '~/components/ui/input/select';
import { useTtsProvider, useTtsVoice } from '~/hooks/queries/ttsQueries';
import { useUpdateTtsVoice } from '~/hooks/queries/ttsMutations';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New TTS Voice' }];
}

const genreOptions = [
  {
    value: 'All',
    label: 'All',
  },
  {
    value: 'Male',
    label: 'Male',
  },
  {
    value: 'Female',
    label: 'Female',
  },
];

export default function TTSVoiceEdit({ params }: Route.ComponentProps) {
  const { ttsVoiceId, ttsProviderId } = params;
  const { data: ttsVoice, isLoading: isLoadingTtsVoice } = useTtsVoice(ttsVoiceId);
  const { data: ttsProvider } = useTtsProvider(ttsProviderId);
  const { mutate: updateTtsVoice, isPending: isUpdatingTtsVoice, error: errorUpdateTtsVoice } = useUpdateTtsVoice();

  const providerName = ttsProvider?.name || 'provider';

  const navigate = useNavigate();
  const [gender, setGender] = useState<string>(ttsVoice?.gender ?? 'All');

  const handleClose = () => {
    navigate(`${ROUTES.services}/tts`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const jsonData = Object.fromEntries(formData.entries());

    updateTtsVoice(
      { ttsVoiceId, jsonData },
      {
        onSuccess: handleClose,
      }
    );
  };

  if (isLoadingTtsVoice) {
    return (
      <Modal.Root defaultOpen>
        <Modal.Content>
          <div className='py-10 text-center'>Loading...</div>
        </Modal.Content>
      </Modal.Root>
    );
  }

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
            <Modal.Title>
              Edit {ttsVoice.name} for {providerName}
            </Modal.Title>
            <Modal.Description className='sr-only'>
              Edit {ttsVoice.name} for {providerName}
            </Modal.Description>
            <form className='w-full flex flex-col mt-[18px]' onSubmit={handleSubmit}>
              <Modal.Body className='flex flex-col gap-5'>
                <ErrorsBox errors={errorUpdateTtsVoice} />
                <input type='hidden' name='ttsVoiceId' value={ttsVoice.id} />

                <Input.Root>
                  <Input.Label id='name' htmlFor='name'>
                    Voice Name
                  </Input.Label>
                  <Input.Input
                    className='text-base-black border border-neutral-04 py-3.5 px-3'
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
                    className='text-base-black border border-neutral-04 py-3.5 px-3'
                    id='providerVoiceId'
                    name='providerVoiceId'
                    type='text'
                    defaultValue={ttsVoice.providerVoiceId}
                  />
                </Input.Root>
                <Select.Root
                  onValueChange={(value) => {
                    setGender(value);
                  }}
                  defaultValue={ttsVoice.gender}
                >
                  <Select.Label>Gender</Select.Label>
                  <Select.Trigger className='border-neutral-04 outline-neutral-04 outline py-3.5 -mt-2'>
                    <Select.Value placeholder='Gender' />
                  </Select.Trigger>
                  <Select.Content className='z-[1000001]'>
                    {genreOptions.map((item) => (
                      <Select.Item key={item.value} value={item.value}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                  <input type='hidden' name='gender' value={gender} />
                </Select.Root>

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
        ) : null}
      </Modal.Content>
    </Modal.Root>
  );
}
