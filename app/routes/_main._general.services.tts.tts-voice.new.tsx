import { redirect, useFetcher, useNavigate, useSearchParams } from 'react-router';
import type { TtsVoice } from '~/types';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import * as Modal from '~/components/ui/new-modal';
import ErrorsBox from '~/components/ui/input/errorsBox';
import type { Route } from './+types/_main._general.services.tts.tts-voice.new';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New TTS Voice' }];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const jsonData: Record<string, any> = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    const res = await fetchWithAuth('tts-voices', {
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

    const ttsVoice: TtsVoice = await res.json();
    return redirect(`/services/tts`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function NewTtsVoice() {
  const [searchParams] = useSearchParams();
  const ttsProviderId = searchParams.get('id') || '';
  const providerName = searchParams.get('name') || '';
  const fetcher = useFetcher<{ errors?: string }>();
  const navigate = useNavigate();
  const errors = fetcher.data?.errors;

  const handleClose = () => {
    navigate(`/services/tts`, { replace: true });
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
        <fetcher.Form method='POST' className='w-full flex flex-col mt-[18px]'>
          <Modal.Body className='flex flex-col gap-5'>
            <ErrorsBox errors={errors} />
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
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
