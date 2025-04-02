import { redirect, useFetcher, useNavigate } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.preferences.ai.ai-provider.new';
import * as Button from '~/components/ui/button/button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Drawer from '~/components/ui/drawer';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import { useRef, useState } from 'react';
import { cn } from '~/utils/cn';
import type { AiProvider } from '~/types';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New AI Provider' }];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const res = await fetchWithAuth('ai-providers', {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      return await res.json();
    }

    const aiProvider: AiProvider = await res.json();
    return redirect(`/ai-providers/${aiProvider.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function ApiProviderNew() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preventFileOpen, setPreventFileOpen] = useState(false);

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
    navigate(`/preferences/ai`);
  };

  return (
    <Drawer.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Drawer.Content>
        <Drawer.Title>Create AI Provider</Drawer.Title>
        <fetcher.Form method='post' action='/ai-providers/new' encType='multipart/form-data' className='size-full flex flex-col'>
          <Drawer.Body className='flex flex-col gap-3'>
            <div className='flex flex-col items-center justify-center mb-10'>
              <div className='relative'>
                <label
                  className='size-40 bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative'
                  onClick={handleLabelClick}
                >
                  <input ref={fileInputRef} className='hidden' type='file' name='picture' accept='image/*' onChange={handleImageChange} />
                  {selectedImage !== null ? (
                    <div className='size-full'>
                      <img src={selectedImage} alt='API Provider' className='size-full object-cover rounded-lg' />
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
                        selectedImage && 'divide-x divide-neutral-04 gap-4'
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
                placeholder='Name'
                required
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
                placeholder='API Key'
                required
              />
            </Input.Root>
            <Input.Root>
              <Input.Label id='basePath' htmlFor='basePath'>
                Base Path
              </Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='basePath'
                name='basePath'
                type='text'
                placeholder='Base path'
                required
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
