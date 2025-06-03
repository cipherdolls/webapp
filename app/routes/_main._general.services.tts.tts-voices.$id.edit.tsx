import { redirect, useNavigate, useFetcher, useSearchParams } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { TtsVoice } from '~/types';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
import type { Route } from './+types/_main._general.services.tts.tts-voices.$id.edit';
import ErrorsBox from '~/components/ui/input/errorsBox';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Icons } from '~/components/ui/icons';
import { useState } from 'react';
import * as Select from '~/components/ui/input/select';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New TTS Voice' }];
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const jsonData: Record<string, any> = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    const res = await fetchWithAuth(`tts-voices/${params.id}`, {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData),
    });

    if (!res.ok) {
      const responseData = await res.json();
      return {
        errors: responseData.message || 'Request failed',
      };
    }

    return redirect(`/services/tts`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const ttsVoiceId = params.id;
  const res = await fetchWithAuth(`tts-voices/${ttsVoiceId}`);
  return await res.json();
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

export default function TTSVoiceEdit({ loaderData }: Route.ComponentProps) {
  const ttsVoice = loaderData as TtsVoice;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const providerName = searchParams.get('providerName') || '';
  const [gender, setGender] = useState<string>(ttsVoice.gender || '');
  const errors = fetcher.data?.errors;

  const handleClose = () => {
    navigate(`/services/tts`);
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content>
        <Modal.Title>
          Edit {ttsVoice.name} for {providerName}
        </Modal.Title>
        <Modal.Description className='sr-only'>
          Edit {ttsVoice.name} for {providerName}
        </Modal.Description>
        <fetcher.Form method='PATCH' className='size-full flex flex-col mt-[18px]'>
          <Modal.Body className='flex flex-col gap-5'>
            <ErrorsBox errors={errors} />
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
            <Select.Root value={gender} onValueChange={setGender}>
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
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
