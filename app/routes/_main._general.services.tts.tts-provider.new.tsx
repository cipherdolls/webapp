import { useNavigate } from 'react-router';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import { useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import ErrorsBox from '~/components/ui/input/errorsBox';
import type { Route } from './+types/_main._general.services.tts.tts-provider.new';
import { useCreateTtsProvider } from '~/hooks/queries/ttsMutations';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New TTS Provider' }];
}

export default function TtsProviderNew() {
  const { mutate: createTtsProvider, isPending: isCreatingTtsProvider, error: errorCreateTtsProvider } = useCreateTtsProvider();
  const navigate = useNavigate();
  const [censored, setCensored] = useState(false);

  const handleClose = () => {
    navigate(`${ROUTES.services}/tts`, { replace: true });
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

    createTtsProvider(jsonData, {
      onSuccess: (data) => {
        navigate(`/tts-providers/${data.id}`);
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
        <Modal.Title>Create TTS Provider</Modal.Title>
        <Modal.Description className='sr-only'>Create TTS Provider</Modal.Description>
        <form onSubmit={handleSubmit} className='w-full flex flex-col mt-[18px]'>
          <Modal.Body className='flex flex-col gap-5'>
            <ErrorsBox errors={errorCreateTtsProvider} />
            <Input.Root>
              <Input.Label id='name' htmlFor='name'>
                Name
              </Input.Label>
              <Input.Input
                className='text-base-black py-3.5 px-3'
                id='name'
                name='name'
                type='text'
                placeholder='Name'
              />
            </Input.Root>
            <Input.Root>
              <Input.Label id='dollarPerCharacter' htmlFor='dollarPerCharacter'>
                Dollar per character
              </Input.Label>
              <Input.Input
                className='text-base-black py-3.5 px-3'
                id='dollarPerCharacter'
                name='dollarPerCharacter'
                type='number'
                step='0.0000001'
                placeholder='0'
              />
            </Input.Root>
            <Input.Root>
              <Input.Label id='exampleVoiceText' htmlFor='exampleVoiceText'>
                Example voice text
              </Input.Label>
              <Input.Input
                className='text-base-black py-3.5 px-3'
                id='exampleVoiceText'
                name='exampleVoiceText'
                type='text'
                placeholder='Hello, this is a test.'
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
