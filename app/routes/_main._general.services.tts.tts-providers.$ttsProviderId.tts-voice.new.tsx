import { useNavigate } from 'react-router';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Modal from '~/components/ui/new-modal';
import ErrorsBox from '~/components/ui/input/errorsBox';
import type { Route } from './+types/_main._general.services.tts.tts-providers.$ttsProviderId.tts-voice.new';
import { useCreateTtsVoice } from '~/hooks/queries/ttsMutations';
import { useTtsProvider } from '~/hooks/queries/ttsQueries';
import { ROUTES } from '~/constants';
import * as Select from '~/components/ui/input/select';
import { useState } from 'react';

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

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New TTS Voice' }];
}

export default function NewTtsVoice({ params }: Route.ComponentProps) {
  const { ttsProviderId } = params;
  const { data: ttsProvider } = useTtsProvider(ttsProviderId);
  const { mutate: createTtsVoice, isPending: isCreatingTtsVoice, error: errorCreateTtsVoice } = useCreateTtsVoice();
  const providerName = ttsProvider?.name || '';
  const navigate = useNavigate();
  const [gender, setGender] = useState<string>('All');

  const handleClose = () => {
    navigate(`${ROUTES.services}/tts`, { replace: true });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const jsonData = Object.fromEntries(formData.entries());
    createTtsVoice(jsonData, {
      onSuccess: handleClose,
    });
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open: boolean) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content>
        <Modal.Title>{ttsProviderId ? `Add TTS Voice for ${providerName}` : 'Add New TTS Voice'}</Modal.Title>
        <Modal.Description className='sr-only'>Create a new TTS voice</Modal.Description>
        <form className='w-full flex flex-col mt-[18px]' onSubmit={handleSubmit}>
          <Modal.Body className='flex flex-col gap-5'>
            <ErrorsBox errors={errorCreateTtsVoice} />
            <input type='hidden' name='ttsProviderId' value={ttsProviderId} />

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
            <Select.Root
              onValueChange={(value) => {
                setGender(value);
              }}
              defaultValue={gender}
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
      </Modal.Content>
    </Modal.Root>
  );
}
