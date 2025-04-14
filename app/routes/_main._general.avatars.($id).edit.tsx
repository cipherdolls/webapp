import { Link, redirect, useFetcher } from 'react-router';
import type { Route } from './+types/_main._general.avatars.($id).edit';
import type { Avatar, TtsVoice, Scenario } from '~/types';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import Multiselect from '~/components/ui/input/multiselect';
import PlayerButton from '~/components/PlayerButton';
import { PATHS } from '~/constants';
import { useRef, useState } from 'react';
import SelectVoiceModal from '~/components/selectVoiceModal';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import PublishAvatarModal from '~/components/publishAvatarModal';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatar edit' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const avatarId = params.id;
  const [avatarResponse, ttsVoicesResponse, scenariosResponse] = await Promise.all([
    fetchWithAuth(`avatars/${avatarId}`),
    fetchWithAuth('tts-voices'),
    fetchWithAuth('scenarios'),
  ]);

  const avatar: Avatar = await avatarResponse.json();
  const ttsVoices: TtsVoice[] = await ttsVoicesResponse.json();
  const scenarios: Scenario[] = await scenariosResponse.json();

  return { avatar, ttsVoices, scenarios };
}

export default function AvatarEdit({ loaderData }: Route.ComponentProps) {
  const { avatar, ttsVoices, scenarios } = loaderData;
  const fetcher = useFetcher();
  const [selectedVoice, setSelectedVoice] = useState<TtsVoice>(avatar.ttsVoice);
  const [selectedImage, setSelectedImage] = useState<string | null>(avatar.picture ?? null);
  const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>(Array.isArray(avatar.scenarios) ? avatar.scenarios : []);
  const [preventFileOpen, setPreventFileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [availability, setAvailability] = useState<'private' | 'public'>(avatar.published ? 'public' : 'private');

  const handleVoiceChange = (voice: TtsVoice) => {
    setSelectedVoice(voice);
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

  const handlePublishConfirm = () => {
    setAvailability('public');
  };

  return (
    <fetcher.Form method='PATCH' action='/avatars/update' encType='multipart/form-data' className='w-full'>
      <input hidden name='avatarId' defaultValue={avatar.id} />
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        <div className='flex items-center justify-between'>
          <Link to={`/avatars/${avatar.id}`} className='flex items-center gap-4 text-heading-h3 font-semibold'>
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
            <div className='relative'>
              <label
                className='sm:h-60 h-[263px] w-full bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative'
                onClick={handleLabelClick}
              >
                <input ref={fileInputRef} className='hidden' type='file' name='picture' accept='image/*' onChange={handleImageChange} />
                {selectedImage !== null ? (
                  <div className='size-full'>
                    <img
                      src={selectedImage.startsWith('blob:') ? selectedImage : getPicture(avatar, 'avatars', false)}
                      srcSet={!selectedImage.startsWith('blob:') ? getPicture(avatar, 'avatars', true) : undefined}
                      alt={avatar.name}
                      className='size-full object-cover rounded-lg'
                    />
                  </div>
                ) : (
                  <div className='flex items-center justify-center size-full'>
                    <Icons.fileUploadIcon />
                  </div>
                )}
              </label>
              <div className='absolute z-10 bottom-3 right-3'>
                <div className='flex items-center justify-between w-full'>
                  <div
                    className={cn(
                      'py-2 px-5 flex items-center justify-center bg-base-white shadow-bottom-level-1 rounded-full',
                      (selectedImage || avatar.picture) && 'divide-x divide-neutral-04 gap-4'
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
            <div className='col-span-2 flex flex-col gap-5'>
              <h1 className='text-base-black text-heading-h3 font-semibold'>Scenarios</h1>
              <Multiselect<Scenario>
                options={scenarios}
                selectedOptions={selectedScenarios}
                onChange={setSelectedScenarios}
                placeholder='Select scenarios for this avatar'
                defaultValue={Array.isArray(avatar.scenarios) ? avatar.scenarios.map((scenario) => scenario.id) : []}
              />
              {Array.isArray(selectedScenarios) &&
                selectedScenarios.length > 0 &&
                selectedScenarios.map((scenario) => <input key={scenario.id} type='hidden' name='scenarioIds[]' value={scenario.id} />)}
            </div>
            <div className='sm:flex hidden flex-col gap-5'>
              <h1 className='text-base-black text-heading-h3 font-semibold sm:block hidden'>Availability</h1>
              <div className='p-1 bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 grid grid-cols-2 rounded-xl'>
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
                <PublishAvatarModal onConfirm={handlePublishConfirm}>
                  <button
                    type='button'
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      availability === 'public' ? 'bg-white' : 'bg-transparent'
                    )}
                  >
                    🌐 Public
                  </button>
                </PublishAvatarModal>
              </div>
            </div>
          </div>
        </div>
        <div className='flex sm:hidden flex-col gap-5 sm:static absolute w-full sm:w-auto left-0 px-4.5 pt-4.5 sm:px-0 sm:pt-0 sm:pb-0 pb-4.5 sm:rounded-t-none rounded-t-xl bottom-0 sm:bg-none bg-[linear-gradient(86.23deg,rgba(254,253,248,0.48)_0%,rgba(255,255,255,0.48)_100%)] shadow-bottom-bar backdrop-blur-48'>
          <h1 className='text-base-black text-heading-h3 font-semibold sm:block hidden'>Availability</h1>
          <div className='p-1 bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 grid grid-cols-2 rounded-xl'>
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
            <PublishAvatarModal onConfirm={handlePublishConfirm}>
              <button
                type='button'
                className={cn(
                  'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                  availability === 'public' ? 'bg-white' : 'bg-transparent'
                )}
              >
                🌐 Public
              </button>
            </PublishAvatarModal>
          </div>
        </div>
        <input type='hidden' name='published' value={availability === 'public' ? 'true' : 'false'} />
      </div>
    </fetcher.Form>
  );
}
