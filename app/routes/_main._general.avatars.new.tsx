import { Form, Link, redirect, useFetcher } from 'react-router';
import type { Route } from './+types/_main._general.avatars.new';
import type { ApiError, Avatar, TtsVoice, Scenario } from '~/types';
import { use, useEffect, useState } from 'react';
import { Icons } from '~/components/ui/icons';
import SelectVoiceModal from '~/components/selectVoiceModal';
import { cn } from '~/utils/cn';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import Multiselect from '~/components/ui/input/multiselect';
import { showToast } from '~/components/ui/toast';
import PlayerButton from '~/components/PlayerButton';
import { PATHS } from '~/constants';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatars' }];
}

export async function clientLoader() {
  const [ttsVoicesResponse, scenariosResponse] = await Promise.all([fetchWithAuth('tts-voices'), fetchWithAuth('scenarios')]);

  const ttsVoices = await ttsVoicesResponse.json();
  const scenarios = await scenariosResponse.json();

  return { ttsVoices, scenarios };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const res = await fetchWithAuth('avatars', {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      return await res.json();
    }

    const avatar: Avatar = await res.json();
    return redirect(`/avatars/${avatar.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function AvatarNew({ loaderData }: Route.ComponentProps) {
  const { ttsVoices, scenarios }: { ttsVoices: TtsVoice[]; scenarios: Scenario[] } = loaderData;
  const fetcher = useFetcher();
  const apiError: ApiError = fetcher.data;
  console.log(ttsVoices);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<TtsVoice | null>(ttsVoices && ttsVoices.length > 0 ? ttsVoices[0] : null);
  const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>([]);
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

  const handleVoiceChange = (voice: TtsVoice) => {
    setSelectedVoice(voice);
  };

  return (
    <fetcher.Form method='post' action='/avatars/new' encType='multipart/form-data' className='w-full'>
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
            Create Avatar
          </Link>
          <Button.Root disabled={false} className='w-[186px]' type='submit'>
            Save Avatar
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
                <Input.Label id='shortDesc' htmlFor='shortDesc'>
                  Short Description
                </Input.Label>
                <Input.Input id='shortDesc' name='shortDesc' type='text' placeholder='Fun, smart, sweet etc.' />
              </Input.Root>
              <Textarea.Root className='col-span-2'>
                <Textarea.Label htmlFor='character'>Character</Textarea.Label>
                <Textarea.Wrapper>
                  <Textarea.Textarea id='character' name='character' placeholder='Describe your avatar' />
                </Textarea.Wrapper>
              </Textarea.Root>
            </div>
          </div>
          <div className='sm:pl-4 sm:max-w-[352px] flex size-full flex-col gap-10'>
            <label className='sm:h-60 h-40 w-full bg-gradient-1 backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer'>
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
                  <PlayerButton variant='white' className='shrink-0 shadow-bottom-level-1' audioSrc={PATHS.ttsVoice(selectedVoice.id)} />
                  <div className='flex flex-col gap-1'>
                    <p className='text-body-lg font-semibold text-base-black'>{selectedVoice.name}</p>
                    <span className='text-body-md text-neutral-01'>Unrealspeach</span>
                    <input type='hidden' name='ttsVoiceId' id='ttsVoiceId' value={selectedVoice.id} />
                  </div>
                </div>
              )}
            </div>
            <div className='col-span-2 flex flex-col gap-5'>
              <h1 className='text-base-black text-heading-h3 font-semibold'>Scenarios</h1>
              <Multiselect<Scenario>
                options={scenarios}
                selectedOptions={selectedScenarios}
                onChange={setSelectedScenarios}
                placeholder='Select scenarios for this avatar'
              />
              {Array.isArray(selectedScenarios) &&
                selectedScenarios.length > 0 &&
                selectedScenarios.map((scenario) => <input key={scenario.id} type='hidden' name='scenarioIds[]' value={scenario.id} />)}
            </div>
            <div className='flex flex-col gap-5 pb-5'>
              <h1 className='text-base-black text-heading-h3 font-semibold'>Availability</h1>
              <div className='flex flex-col gap-3'>
                <div className='p-1 bg-gradient-1 grid grid-cols-2 rounded-xl'>
                  <button
                    type='button'
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      availability === 'private' ? 'bg-white' : 'bg-transparent'
                    )}
                    onClick={() => setAvailability('private')}
                  >
                    🔒 Private
                  </button>
                  <button
                    type='button'
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
        <input type='hidden' name='published' value={availability === 'public' ? 'true' : 'false'} />
      </div>
    </fetcher.Form>
  );
}
