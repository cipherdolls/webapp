import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.tts-providers.$ttsProviderId.edit';
import * as Button from '~/components/ui/button/button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Drawer from '~/components/ui/drawer';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import { useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { useTtsProvider } from '~/hooks/queries/ttsQueries';
import { useUpdateTtsProvider } from '~/hooks/queries/ttsMutations';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit TTS Provider' }];
}

export default function TtsProviderEdit({ params }: Route.ComponentProps) {
  const { data: ttsProvider, isLoading } = useTtsProvider(params.ttsProviderId);
  const { mutate: updateTtsProvider, isPending: isUpdatingTtsProvider, error: errorUpdateTtsProvider } = useUpdateTtsProvider();

  const navigate = useNavigate();
  const [censored, setCensored] = useState(ttsProvider?.censored ?? false);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const jsonData: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      jsonData[key] = value;
    }
    jsonData.dollarPerCharacter = Number(jsonData.dollarPerCharacter);
    jsonData.censored = jsonData.censored === 'true';
    updateTtsProvider(
      { ttsProviderId: params.ttsProviderId, jsonData },
      {
        onSuccess: () => {
          navigate(`${ROUTES.services}/tts`);
        },
      }
    );
  };

  return (
    <Drawer.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Drawer.Content>
        <Drawer.Title>Edit TTS Provider</Drawer.Title>
        {ttsProvider ? (
          <form onSubmit={handleSubmit} className='size-full flex flex-col'>
            <Drawer.Body className='flex flex-col gap-3'>
              <ErrorsBox errors={errorUpdateTtsProvider} />
              <Input.Root>
                <Input.Label id='name' htmlFor='name'>
                  Name
                </Input.Label>
                <Input.Input
                  className='text-base-black border border-neutral-04 py-3.5 px-3'
                  id='name'
                  name='name'
                  type='text'
                  defaultValue={ttsProvider.name}
                />
              </Input.Root>
              <Input.Root>
                <Input.Label id='dollarPerCharacter' htmlFor='dollarPerCharacter'>
                  Dollar per character
                </Input.Label>
                <Input.Input
                  className='text-base-black border border-neutral-04 py-3.5 px-3'
                  id='dollarPerCharacter'
                  name='dollarPerCharacter'
                  type='number'
                  step='0.0000001'
                  defaultValue={ttsProvider.dollarPerCharacter}
                />
              </Input.Root>
              <Input.Root>
                <Input.Label id='exampleVoiceText' htmlFor='exampleVoiceText'>
                  Example voice text
                </Input.Label>
                <Input.Input
                  className='text-base-black border border-neutral-04 py-3.5 px-3'
                  id='exampleVoiceText'
                  name='exampleVoiceText'
                  type='text'
                  defaultValue={ttsProvider.exampleVoiceText}
                />
              </Input.Root>
              <div className='flex items-center gap-2'>
                <Checkbox.Root
                  className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 data-[state=checked]:bg-base-black bg-transparent outline-none focus:shadow-neutral-02'
                  id='censored'
                  checked={censored}
                  onCheckedChange={(checked) => setCensored(checked === true)}
                >
                  <Checkbox.Indicator>
                    <Icons.check className='text-white size-4.5' />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <input type='hidden' name='censored' value={censored ? 'true' : 'false'} />
                <label className='text-body-sm font-semibold text-neutral-01' htmlFor='censored'>
                  Censored
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
        ) : (
          <p className='text-body-md text-neutral-01 font-semibold text-center py-5'>Tts provider not found</p>
        )}
        <Dialog.Close asChild>
          <button
            className='absolute focus:outline-none -left-[78px] top-4.5 size-10 bg-white rounded-full items-center justify-center z-10 sm:flex hidden'
            aria-label='Close'
            onClick={handleClose}
          >
            <Icons.close className='text-base-black' />
          </button>
        </Dialog.Close>
      </Drawer.Content>
    </Drawer.Root>
  );
}
