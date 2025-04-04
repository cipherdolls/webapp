import { Link, redirect, useFetcher, useNavigate } from 'react-router';
import { getPicture } from '~/utils/getPicture';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { TtsProvider } from '~/types';
import type { Route } from './+types/_main._general.tts-providers.$ttsProvider.edit';
import * as Button from '~/components/ui/button/button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Drawer from '~/components/ui/drawer';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import { useRef, useState } from 'react';
import { cn } from '~/utils/cn';
import ErrorsBox from '~/components/ui/input/errorsBox';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit TTS Provider' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const ttsProviderId = params.ttsProvider;
  const res = await fetchWithAuth(`tts-providers/${ttsProviderId}`);
  return await res.json();
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const ttsProviderId = formData.get('ttsProviderId');

    const newApiKey = formData.get('apiKey');
    const originalApiKey = formData.get('originalApiKey');

    if (!newApiKey && originalApiKey) {
      formData.set('apiKey', originalApiKey);
    }

    formData.delete('originalApiKey');

    const res = await fetchWithAuth(`tts-providers/${ttsProviderId}`, {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      const responseData = await res.json();
      return {
        errors: responseData.message || 'Request failed',
      };
    }

    const ttsProvider: TtsProvider = await res.json();
    return redirect(`/tts-providers/${ttsProvider.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function TtsProviderEdit({ loaderData }: Route.ComponentProps) {
  const ttsProvider: TtsProvider = loaderData;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(ttsProvider.picture ?? null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preventFileOpen, setPreventFileOpen] = useState(false);

  const errors = fetcher.data?.errors;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    if (preventFileOpen) {
      e.preventDefault();
      setPreventFileOpen(false);
      return;
    }
  };

  const handleTrashClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(null);

    setPreventFileOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    navigate(`/tts-providers/${ttsProvider.id}`);
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
        <fetcher.Form method='PATCH' encType='multipart/form-data' className='size-full flex flex-col'>
          <Drawer.Body className='flex flex-col gap-3'>
            <ErrorsBox errors={errors} />
            <input type='hidden' name='ttsProviderId' value={ttsProvider.id} />
            <div className='flex flex-col items-center justify-center mb-10'>
              <div className='relative'>
                <label
                  className='size-40 bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative'
                  onClick={handleLabelClick}
                >
                  <input ref={fileInputRef} className='hidden' type='file' name='picture' accept='image/*' onChange={handleImageChange} />
                  {selectedImage !== null ? (
                    <div className='size-full'>
                      <img
                        src={selectedImage.startsWith('blob:') ? selectedImage : getPicture(ttsProvider, 'tts-providers', false)}
                        srcSet={!selectedImage.startsWith('blob:') ? getPicture(ttsProvider, 'tts-providers', true) : undefined}
                        alt={ttsProvider.name}
                        className='size-full object-cover rounded-lg'
                      />
                    </div>
                  ) : (
                    <div className='flex items-center justify-center size-full'>
                      <Icons.fileUploadIcon />
                    </div>
                  )}
                </label>
                <div className='absolute z-10 bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2'>
                  <div className='flex items-center justify-between w-full'>
                    <div
                      className={cn(
                        'py-2 px-5 flex items-center justify-center bg-base-white shadow-bottom-level-2 rounded-full',
                        (selectedImage || ttsProvider.picture) && 'divide-x divide-neutral-04 gap-4'
                      )}
                    >
                      {selectedImage !== null && (
                        <button type='button' className='pr-4 relative z-10' onClick={handleTrashClick}>
                          <Icons.trash className='text-black' />
                        </button>
                      )}
                      <Icons.fileUpload className='cursor-pointer' onClick={() => fileInputRef.current?.click()} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <Input.Label id='apiKey' htmlFor='apiKey'>
                API Key
              </Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='apiKey'
                name='apiKey'
                type='text'
                placeholder='Enter new API key if you want to change it'
              />
              <input type='hidden' name='originalApiKey' value={ttsProvider.apiKey} />
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
              <Input.Label id='hostname' htmlFor='hostname'>
                Hostname
              </Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='hostname'
                name='hostname'
                type='text'
                defaultValue={ttsProvider.hostname}
              />
            </Input.Root>
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
        </fetcher.Form>
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
