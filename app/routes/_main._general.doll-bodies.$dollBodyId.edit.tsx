import { Link, redirect, useFetcher, useNavigate } from 'react-router';
import { getPicture } from '~/utils/getPicture';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { DollBody, Avatar } from '~/types';
import type { Route } from './+types/_main._general.doll-bodies.$dollBodyId.edit';
import * as Button from '~/components/ui/button/button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Drawer from '~/components/ui/drawer';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import { useRef, useState } from 'react';
import { cn } from '~/utils/cn';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Doll Body' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const dollBodyId = params.dollBodyId;
  const dollBodyRes = await fetchWithAuth(`doll-bodies/${dollBodyId}`);
  const dollBody = await dollBodyRes.json();

  const avatarsRes = await fetchWithAuth('avatars');
  const avatars = await avatarsRes.json();

  return { dollBody, avatars };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const dollBodyId = formData.get('dollBodyId');

    const res = await fetchWithAuth(`doll-bodies/${dollBodyId}`, {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      return await res.json();
    }

    const dollBody: DollBody = await res.json();
    return redirect(`/doll-bodies/${dollBody.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function DollBodyEdit({ loaderData }: Route.ComponentProps) {
  const { dollBody, avatars } = loaderData;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(dollBody.picture ?? null);
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
    navigate(`/doll-bodies/${dollBody.id}`);
  };

  return (
    <Drawer.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Drawer.Content>
        <Drawer.Title>Edit Doll Body</Drawer.Title>
        <fetcher.Form method='PATCH' encType='multipart/form-data' className='size-full flex flex-col'>
          <Drawer.Body className='flex flex-col gap-3'>
            <input type='hidden' name='dollBodyId' value={dollBody.id} />

            <div className='flex flex-col items-center justify-center mb-10'>
              <div className='relative'>
                <label
                  className='size-40 bg-none sm:bg-transparent bg-neutral-04 sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative'
                  onClick={handleLabelClick}
                >
                  <input ref={fileInputRef} className='hidden' type='file' name='picture' accept='image/*' onChange={handleImageChange} />
                  {selectedImage !== null ? (
                    <div className='size-full'>
                      <img
                        src={selectedImage.startsWith('blob:') ? selectedImage : getPicture(dollBody, 'dollBodies', false)}
                        srcSet={!selectedImage.startsWith('blob:') ? getPicture(dollBody, 'dollBodies', true) : undefined}
                        alt={dollBody.name}
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
                        (selectedImage || dollBody.picture) && 'divide-x divide-neutral-04 gap-4'
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
                defaultValue={dollBody.name}
                placeholder='Enter doll body name'
                required
              />
              <p className='text-xs text-gray-500'>Enter the name for this doll body.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='description'>Description</Input.Label>
              <Textarea.Textarea
                id='description'
                name='description'
                className='w-full border border-neutral-04 py-3.5 px-3 text-base-black'
                placeholder='Describe the doll body'
                defaultValue={dollBody.description}
                rows={5}
                required
              />
              <p className='text-xs text-gray-500'>Provide a description for this doll body.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='avatarId'>Default Avatar</Input.Label>
              <select
                id='avatarId'
                name='avatarId'
                defaultValue={dollBody.avatar.id}
                className='flex h-10 w-full rounded-md border border-neutral-04 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-01 focus:outline-none focus:ring-2 focus:ring-neutral-03 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                required
              >
                {avatars.map((avatar: Avatar) => (
                  <option key={avatar.id} value={avatar.id} selected={avatar.id === dollBody.avatar.id}>
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