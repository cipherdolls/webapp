import { Link, redirect, useFetcher } from 'react-router';
import type { ApiError, AiProvider } from '~/types';
import { useState } from 'react';
import { Icons } from '~/components/ui/icons';
import { cn } from '~/utils/cn';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import { showToast } from '~/components/ui/toast';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.ai-providers.new';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Ai Provider' }];
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

export default function AiProviderNew({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const apiError: ApiError = fetcher.data;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [availability, setAvailability] = useState<'private' | 'public'>('private');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);

      showToast({
        emoji: '🖼️',
        title: 'Looks nice!',
        description: 'Image was updated',
      });
    }
  };

  return (
    <fetcher.Form method='post' action='/ai-providers/new' encType='multipart/form-data' className='w-full'>
      {apiError && (
        <>
          <div>{apiError.statusCode}</div>
          <div>{apiError.error}</div>
          <div>{apiError.message}</div>
        </>
      )}

      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 size-full'>
        <div className='flex items-center justify-between'>
          <Link to={'/'} className='flex items-center gap-4 text-heading-h3 font-semibold'>
            <Icons.chevronLeft />
            Create AiProvider
          </Link>
          <Button.Root disabled={false} className='w-[186px]' type='submit'>
            Save AiProvider
          </Button.Root>
        </div>
        <div className='flex sm:flex-row flex-col sm:gap-0 gap-6 sm:flex-1 sm:divide-x divide-neutral-04'>
          <div className='sm:pr-4 flex size-full'>
            <div className='grid grid-cols-2 gap-5 w-full h-max'>
              <Input.Root>
                <Input.Label id='name' htmlFor='name'>
                  Name
                </Input.Label>
                <Input.Input id='name' name='name' type='text' placeholder='Add a name' />
              </Input.Root>

              <Input.Root>
                <Input.Label id='basePath' htmlFor='basePath'>
                  basePath
                </Input.Label>
                <Input.Input id='basePath' name='basePath' type='text' placeholder='https://api.openai.com' />
              </Input.Root>
            </div>
          </div>
          <div className='sm:pl-4 sm:max-w-[352px] flex size-full flex-col gap-10'>
            <label className='sm:h-60 h-40 w-full bg-gradient-1 backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer'>
              <input className='hidden' type='file' name='picture' id='picture' accept='image/*' onChange={handleImageChange} />
              {selectedImage ? (
                <div className='size-full relative'>
                  <img src={selectedImage} alt='Selected aiProvider' className='size-full object-cover rounded-lg' />
                </div>
              ) : (
                <div className='flex items-center justify-center size-full'>
                  <Icons.fileUploadIcon />
                </div>
              )}
              <div className='absolute z-10 bottom-3 px-3 w-full'>
                <div className='flex items-center justify-center w-full'>
                  <div className='py-2 px-5 flex items-center justify-center bg-base-white shadow-bottom-level-1 rounded-full'>
                    <Icons.fileUpload />
                  </div>
                </div>
              </div>
            </label>

            <div className='flex flex-col gap-5'>
              <h1 className='text-base-black text-heading-h3 font-semibold'>Availability</h1>
              <div className='flex flex-col gap-3'>
                <div className='p-1 bg-gradient-1 grid grid-cols-2 rounded-xl'>
                  <button
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      availability === 'private' ? 'bg-white' : 'bg-transparent'
                    )}
                    onClick={() => setAvailability('private')}
                  >
                    🔒 Private
                  </button>
                  <button
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      availability === 'public' ? 'bg-white' : 'bg-transparent'
                    )}
                    onClick={() => setAvailability('public')}
                  >
                    🌐 Public
                  </button>
                </div>
                <p className='text-body-sm text-neutral-01'>
                  Anyone in the system can use public ai-providers. <br />
                  Once published, you will no longer be able to edit or delete your aiProvider
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </fetcher.Form>
  );
}
