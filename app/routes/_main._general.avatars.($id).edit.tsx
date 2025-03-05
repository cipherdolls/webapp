import { Link, redirect, useFetcher } from 'react-router';
import type { Route } from './+types/_main._general.avatars.($id).edit';
import type { Avatar, TtsVoice } from '~/types';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import PlayerButton from '~/components/PlayerButton';
import { PATHS } from '~/constants';
import { useState } from 'react';
import SelectVoiceModal from '~/components/selectVoiceModal';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatar edit' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  try {
    const avatarId = params.id;

    const [avatarResponse, ttsVoicesResponse] = await Promise.all([fetchWithAuth(`avatars/${avatarId}`), fetchWithAuth('tts-voices')]);

    const avatar = await avatarResponse.json();
    const ttsVoices = await ttsVoicesResponse.json();

    return { avatar, ttsVoices };
  } catch (error) {
    return redirect('/signin');
  }
}

export default function AvatarEdit({ loaderData }: Route.ComponentProps) {
  const avatar: Avatar = loaderData.avatar;
  const ttsVoices: TtsVoice[] = loaderData.ttsVoices;
  const fetcher = useFetcher();
  const [selectedVoice, setSelectedVoice] = useState<TtsVoice>(avatar.ttsVoice);

  const handleVoiceChange = (voice: TtsVoice) => {
    setSelectedVoice(voice);
  };

  return (
    <fetcher.Form method='PATCH' action='/avatars/update' encType='multipart/form-data' className='w-full'>
      <input hidden name='avatarId' defaultValue={avatar.id} />
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        <div className='flex items-center justify-between'>
          <Link to={'/'} className='flex items-center gap-4 text-heading-h3 font-semibold'>
            <Icons.chevronLeft />
            Edit Avatar
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
                <Input.Input
                  className='text-base-black'
                  id='name'
                  name='name'
                  type='text'
                  placeholder='Add a name'
                  defaultValue={avatar.name}
                />
              </Input.Root>
              <Input.Root>
                <Input.Label id='shortDesc' htmlFor='shortDesc'>
                  Short Description
                </Input.Label>
                <Input.Input
                  className='text-base-black'
                  id='shortDesc'
                  name='shortDesc'
                  type='text'
                  placeholder='Fun, smart, sweet etc.'
                  defaultValue={avatar.shortDesc}
                />
              </Input.Root>
              <Textarea.Root className='col-span-2'>
                <Textarea.Label htmlFor='character'>Character</Textarea.Label>
                <Textarea.Wrapper>
                  <Textarea.Textarea
                    className='scrollbar-medium text-base-black'
                    id='character'
                    name='character'
                    placeholder='Describe your avatar'
                    defaultValue={avatar.character}
                  />
                </Textarea.Wrapper>
              </Textarea.Root>
            </div>
          </div>
          <div className='sm:pl-4 sm:max-w-[352px] flex size-full flex-col gap-10'>
            <div className='flex flex-col gap-5'>
              <div className='flex items-center justify-between'>
                <h1 className='text-base-black text-heading-h3 font-semibold'>Voice</h1>
                <SelectVoiceModal ttsVoices={ttsVoices} selectedVoice={selectedVoice} onVoiceChange={handleVoiceChange} />
              </div>
              <div className='voice-gradient py-3 px-4 rounded-xl flex items-center gap-4 shadow-regular'>
                <PlayerButton variant='white' className='shrink-0 shadow-bottom-level-1' audioSrc={PATHS.ttsVoice(selectedVoice.id)} />
                <div className='flex flex-col gap-1'>
                  <p className='text-body-lg font-semibold text-base-black'>{selectedVoice.name}</p>
                  <span className='text-body-md text-neutral-01'>Unrealspeach</span>
                  <input type='hidden' name='ttsVoiceId' id='ttsVoiceId' value={selectedVoice.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </fetcher.Form>
  );
}
