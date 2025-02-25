import { Form, Link, redirect, useFetcher } from 'react-router';
import type { Route } from './+types/_main.avatars.new';
import type { Avatar, TtsVoice } from '~/types';
import { use, useEffect, useState } from 'react';
import { Icons } from '~/components/ui/icons';
import SelectVoiceModal from '~/components/selectVoiceModal';
import { cn } from '~/utils/cn';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatars' }];
}

export async function clientLoader() {
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const options = {
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
  };
  try {
    const res = await fetch(`${backendUrl}/tts-voices`, options);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
    body: formData,
  };
  try {
    const res = await fetch(`${backendUrl}/avatars`, options);

    if (!res.ok) {
      return await res.json();
    }
    const avatar: Avatar = await res.json();
    return redirect(`/avatars/${avatar.id}`);
  } catch (error: any) {
    console.error(error);
  }
}

export default function AvatarNew({ loaderData }: Route.ComponentProps) {
  const ttsVoices: TtsVoice[] = loaderData;
  const fetcher = useFetcher();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<TtsVoice | null>(ttsVoices && ttsVoices.length > 0 ? ttsVoices[0] : null);
  const [availability, setAvailability] = useState<'private' | 'public'>('private');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleVoiceChange = (voice: TtsVoice) => {
    setSelectedVoice(voice);
  };

  return (
    <fetcher.Form method='post' action='/avatars/new' encType='multipart/form-data' className='w-full'>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        <div className='flex items-center justify-between'>
          <Link to={'/'} className='flex items-center gap-4 text-heading-h3 font-semibold'>
            <Icons.chevronLeft />
            Create Avatar
          </Link>
          <button
            type='submit'
            className='py-3 px-[45.5px] rounded-full text-body-md font-semibold disabled:bg-neutral-05 disabled:text-neutral-03 text-base-white bg-base-black'
          >
            Save Avatar
          </button>
        </div>
        <div className='flex sm:flex-row flex-col sm:gap-0 gap-8 sm:flex-1 sm:divide-x divide-neutral-04'>
          <div className='sm:pr-4 flex size-full'>
            <div className='grid grid-cols-2 gap-5 w-full h-max'>
              <div className='flex flex-col gap-2'>
                <label htmlFor='name' id='name' className='text-body-sm font-semibold text-neutral-01'>
                  Name
                </label>
                <input
                  className='py-3 px-3.5 rounded-xl text-body-md text-neutral-02 bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)]'
                  type='text'
                  placeholder='Add a name'
                  name='name'
                  id='name'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label id='shortDesc' htmlFor='shortDesc' className='text-body-sm font-semibold text-neutral-01'>
                  Short Description
                </label>
                <input
                  className='py-3 px-3.5 rounded-xl text-body-md text-neutral-02 bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)]'
                  type='text'
                  placeholder='Fun, smart, sweet etc.'
                  name='shortDesc'
                  id='shortDesc'
                />
              </div>
              <div className='flex flex-col gap-2 col-span-2 '>
                <label htmlFor='character' id='character' className='text-body-sm font-semibold text-neutral-01'>
                  Character
                </label>
                <textarea
                  className='p-3 min-h-[104px] rounded-xl text-body-md text-neutral-02 bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] resize-none'
                  placeholder='Describe your avatar'
                  name='character'
                  id='character'
                />
              </div>
            </div>
          </div>
          <div className='sm:pl-4 sm:max-w-[352px] flex size-full flex-col gap-10'>
            <label className='sm:h-60 h-40 w-full bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer'>
              <input className='hidden' type='file' name='picture' id='picture' accept='image/*' onChange={handleImageChange} />
              {selectedImage ? (
                <div className='size-full relative'>
                  <img src={selectedImage} alt='Selected avatar' className='size-full object-cover rounded-lg' />
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
              <div className='flex items-center justify-between'>
                <h1 className='text-base-black text-heading-h3 font-semibold'>Voice</h1>
                <SelectVoiceModal ttsVoices={ttsVoices} selectedVoice={selectedVoice} onVoiceChange={handleVoiceChange} />
              </div>
              {selectedVoice && (
                <div className='voice-gradient py-3 px-4 rounded-xl flex items-center gap-4 shadow-regular'>
                  <div className='size-10 rounded-full shadow-bottom-level-1 flex items-center justify-center bg-base-white shrink-0'>
                    <Icons.sound />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <p className='text-body-lg font-semibold text-base-black'>{selectedVoice.name}</p>
                    <span className='text-body-md text-neutral-01'>Unrealspeach</span>
                    <input type='hidden' name='ttsVoiceId' id='ttsVoiceId' value={selectedVoice.id} />
                  </div>
                </div>
              )}
            </div>
            <div className='flex flex-col gap-5'>
              <h1 className='text-base-black text-heading-h3 font-semibold'>Availability</h1>
              <div className='flex flex-col gap-3'>
                <div className='p-1 bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] grid grid-cols-2 rounded-xl'>
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
                  Anyone in the system can use public avatars. <br />
                  Once published, you will no longer be able to edit or delete your avatar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </fetcher.Form>
  );
}
