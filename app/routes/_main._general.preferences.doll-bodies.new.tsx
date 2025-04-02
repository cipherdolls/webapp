import { redirect, useFetcher, useNavigate } from 'react-router';

import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.preferences.doll-bodies.new';
import * as Button from '~/components/ui/button/button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Drawer from '~/components/ui/drawer';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import { useState, useRef } from 'react';
import type { Avatar } from '~/types';
import * as Textarea from '~/components/ui/input/textarea';
import { cn } from '~/utils/cn';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Doll Body' }];
}

export async function clientLoader() {
  const res = await fetchWithAuth('avatars');
  return await res.json();
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const res = await fetchWithAuth('doll-bodies', {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      return await res.json();
    }

    const dollBody = await res.json();
    return redirect(`/preferences/doll-bodies`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function DollBodyNew({ loaderData }: Route.ComponentProps) {
  const avatars = loaderData as Avatar[];
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preventFileOpen, setPreventFileOpen] = useState(false);

  const handleClose = () => {
    navigate(`/preferences/doll-bodies`);
  };

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

  return (
    <Drawer.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Drawer.Content>
        <Drawer.Title>Create Doll Body</Drawer.Title>
        <fetcher.Form method='post' encType='multipart/form-data' className='size-full flex flex-col'>
          <Drawer.Body className='flex flex-col gap-4 md:gap-6'>
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
                        src={selectedImage}
                        alt="Doll Body"
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
              <Input.Label htmlFor='name'>Name</Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='name'
                name='name'
                type='text'
                placeholder='Enter doll body name'
                required
              />
              <p className='text-xs text-gray-500'>Enter the name for the new doll body.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='description'>Description</Input.Label>
              <Textarea.Textarea
                id='description'
                name='description'
                className='w-full border border-neutral-04 py-3.5 px-3'
                placeholder='Describe the doll body'
                rows={5}
                required
              />
              <p className='text-xs text-gray-500'>Provide a description for this new doll body.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='avatarId'>Default Avatar</Input.Label>
              <select
                id='avatarId'
                name='avatarId'
                className='flex h-10 w-full rounded-md border border-neutral-04 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-01 focus:outline-none focus:ring-2 focus:ring-neutral-03 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                required
              >
                <option value="">Select an avatar</option>
                {avatars.map((avatar) => (
                  <option key={avatar.id} value={avatar.id}>
                    {avatar.name}
                  </option>
                ))}
              </select>
              <p className='text-xs text-gray-500'>Select the default avatar for this doll body.</p>
            </Input.Root>
          </Drawer.Body>

          <Drawer.Footer>
            <Dialog.Close asChild>
              <Button.Root aria-label='Close' className='sm:hidden block w-full'>
                Close
              </Button.Root>
            </Dialog.Close>
            <Button.Root type='submit' className='w-full'>
              Create Doll Body
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