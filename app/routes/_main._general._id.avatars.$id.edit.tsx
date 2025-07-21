import { redirect, useFetcher, useNavigate, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/_main._general._id.avatars.$id.edit';
import type { Avatar, Gender, Scenario, ScenariosPaginated, TtsVoice, User } from '~/types';
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
import ErrorsBox from '~/components/ui/input/errorsBox';
import * as Modal from '~/components/ui/new-modal';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatar edit' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const avatarId = params.id;
  const [avatarRes, ttsVoicesRes, scenariosRes, publicScenariosRes] = await Promise.all([
    fetchWithAuth(`avatars/${avatarId}`),
    fetchWithAuth('tts-voices'),
    fetchWithAuth('scenarios'),
    fetchWithAuth('scenarios?published=true'),
  ]);

  const avatar: Avatar = await avatarRes.json();
  const ttsVoices: TtsVoice[] = await ttsVoicesRes.json();
  const mineScenarios: ScenariosPaginated = await scenariosRes.json();
  const publicScenarios: ScenariosPaginated = await publicScenariosRes.json();

  const scenarios = [...mineScenarios.data, ...publicScenarios.data];

  return { avatar, ttsVoices, scenarios };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const avatarId = formData.get('avatarId');

    const res = await fetchWithAuth(`avatars/${avatarId}`, {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      const responseData = await res.json();
      return {
        errors: responseData.message || 'Request failed',
      };
    }

    const avatar: Avatar = await res.json();
    return redirect(`/avatars/${avatar.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function AvatarEdit({ loaderData }: Route.ComponentProps) {
  const { avatar, ttsVoices, scenarios } = loaderData;
  const fetcher = useFetcher();
  const me = useRouteLoaderData('routes/_main') as User;
  const navigate = useNavigate();
  const [selectedVoice, setSelectedVoice] = useState<TtsVoice | null>(
    avatar.ttsVoice || (ttsVoices && ttsVoices.length > 0 ? ttsVoices[0] : null)
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(avatar.picture ?? null);
  const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>(Array.isArray(avatar.scenarios) ? avatar.scenarios : []);
  const [preventFileOpen, setPreventFileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [availability, setAvailability] = useState<'private' | 'public'>(avatar.published ? 'public' : 'private');
  const [gender, setGender] = useState<Gender | ''>(avatar.gender || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const errors = fetcher.data?.errors;

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

  const handleClose = () => {
    navigate(`/avatars/${avatar.id}`);
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content
        className={cn(
          'overflow-y-auto flex flex-col scrollbar-medium',
          isExpanded ? 'max-w-none w-[90vw] h-screen' : 'max-h-[calc(100vh-104px)]'
        )}
      >
        <div className='flex items-center justify-between'>
          <Modal.Title>Edit Avatar</Modal.Title>
          <button
            type='button'
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block'
            title={isExpanded ? 'Collapse modal' : 'Expand modal'}
          >
            <Icons.expand />
          </button>
        </div>
        <Modal.Description className='sr-only'>Edit avatar</Modal.Description>
        <fetcher.Form method='PATCH' encType='multipart/form-data' className='w-full flex flex-col mt-[18px] h-full'>
          <Modal.Body className={cn('flex gap-4 md:gap-6 flex-1', isExpanded ? 'flex-row' : 'flex-col')}>
            <ErrorsBox errors={errors} />
            <input type='hidden' name='avatarId' value={avatar.id} />

            {isExpanded && (
              <div className='flex-1 flex flex-col gap-6 pb-5'>
                <Textarea.Root className='h-full'>
                  <Textarea.Label htmlFor='character'>Character</Textarea.Label>
                  <Textarea.Wrapper className='flex-1'>
                    <Textarea.Textarea
                      id='character'
                      name='character'
                      className='w-full border border-neutral-04 py-3.5 px-3 text-base-black h-full resize-none scrollbar-medium max-h-full'
                      placeholder='Describe your avatar'
                      defaultValue={avatar.character}
                      isExpanded={isExpanded}
                    />
                  </Textarea.Wrapper>
                </Textarea.Root>
                <Input.Root>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex flex-col gap-1'>
                      <Input.Label htmlFor='voice'>Voice</Input.Label>
                      <span className='text-sm text-gray-500'>Select a voice for the avatar</span>
                    </div>
                    <SelectVoiceModal ttsVoices={ttsVoices} selectedVoice={selectedVoice} onVoiceChange={handleVoiceChange} />
                  </div>
                  {selectedVoice && (
                    <div className='voice-gradient py-3 px-4 rounded-xl flex items-center gap-4 shadow-regular'>
                      <PlayerButton
                        variant='white'
                        className='shrink-0 shadow-bottom-level-1'
                        audioSrc={PATHS.ttsVoice(selectedVoice.id)}
                      />
                      <div className='flex flex-col gap-1'>
                        <p className='text-body-lg font-semibold text-base-black'>{selectedVoice.name}</p>
                        <span className='text-body-md text-neutral-01'>{selectedVoice.ttsProvider?.name || 'Voice Provider'}</span>
                        <input type='hidden' name='ttsVoiceId' value={selectedVoice.id} />
                      </div>
                    </div>
                  )}
                </Input.Root>
              </div>
            )}

            <div className={cn('flex flex-col gap-4 md:gap-6', isExpanded ? 'flex-1 pb-5' : 'w-full')}>
              <div className={cn('flex flex-col items-center justify-center', isExpanded ? 'mb-5' : 'mb-10')}>
                <div className='relative'>
                  <label
                    className={cn(
                      'bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative',
                      isExpanded ? 'size-32' : 'size-40'
                    )}
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
                  <div className='absolute z-10 bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2'>
                    <div className='flex items-center justify-between w-full'>
                      <div
                        className={cn(
                          'py-2 px-5 flex items-center justify-center bg-base-white shadow-bottom-level-2 rounded-full',
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
              </div>
              <div className='grid grid-cols-1 gap-4'>
                <Input.Root>
                  <Input.Label htmlFor='name'>Name</Input.Label>
                  <Input.Input
                    className='text-base-black border border-neutral-04 py-3.5 px-3'
                    id='name'
                    name='name'
                    type='text'
                    placeholder='Add a name'
                    defaultValue={avatar.name}
                  />
                </Input.Root>
                <Input.Root>
                  <Input.Label htmlFor='shortDesc'>Short Description</Input.Label>
                  <Input.Input
                    className='text-base-black border border-neutral-04 py-3.5 px-3'
                    id='shortDesc'
                    name='shortDesc'
                    type='text'
                    placeholder='Fun, smart, sweet etc.'
                    defaultValue={avatar.shortDesc}
                  />
                </Input.Root>
              </div>

              {!isExpanded && (
                <Textarea.Root>
                  <Textarea.Label htmlFor='character'>Character</Textarea.Label>
                  <Textarea.Wrapper>
                    <Textarea.Textarea
                      className='w-full border border-neutral-04 py-3.5 px-3 text-base-black scrollbar-medium'
                      id='character'
                      name='character'
                      placeholder='Describe your avatar'
                      defaultValue={avatar.character}
                      rows={5}
                    />
                  </Textarea.Wrapper>
                  <p className='text-xs text-gray-500'>Detailed character description.</p>
                </Textarea.Root>
              )}
              {!isExpanded && (
                <Input.Root>
                  <Input.Label htmlFor='voice'>Voice</Input.Label>
                  <div className='flex items-center justify-between mb-3'>
                    <span className='text-sm text-gray-500'>Select a voice for the avatar</span>
                    <SelectVoiceModal ttsVoices={ttsVoices} selectedVoice={selectedVoice} onVoiceChange={handleVoiceChange} />
                  </div>
                  {selectedVoice && (
                    <div className='voice-gradient py-3 px-4 rounded-xl flex items-center gap-4 shadow-regular'>
                      <PlayerButton
                        variant='white'
                        className='shrink-0 shadow-bottom-level-1'
                        audioSrc={PATHS.ttsVoice(selectedVoice.id)}
                      />
                      <div className='flex flex-col gap-1'>
                        <p className='text-body-lg font-semibold text-base-black'>{selectedVoice.name}</p>
                        <span className='text-body-md text-neutral-01'>{selectedVoice.ttsProvider?.name || 'Voice Provider'}</span>
                        <input type='hidden' name='ttsVoiceId' value={selectedVoice.id} />
                      </div>
                    </div>
                  )}
                </Input.Root>
              )}

              <Input.Root>
                <Input.Label htmlFor='gender'>Gender</Input.Label>
                <div className='p-1 bg-neutral-05 grid grid-cols-2 rounded-xl'>
                  <button
                    type='button'
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      gender === 'Female' ? 'bg-white' : 'bg-transparent'
                    )}
                    onClick={() => setGender('Female')}
                  >
                    👩🏻 Female
                  </button>
                  <button
                    type='button'
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      gender === 'Male' ? 'bg-white' : 'bg-transparent'
                    )}
                    onClick={() => setGender('Male')}
                  >
                    🧔🏻‍♂ Male
                  </button>
                </div>
                <input type='hidden' name='gender' value={gender} />
                <p className='text-xs text-gray-500'>Select the gender for this avatar.</p>
              </Input.Root>

              <Input.Root>
                <Input.Label htmlFor='scenarios'>Scenarios</Input.Label>
                <Multiselect<Scenario>
                  userId={me.id}
                  options={scenarios}
                  selectedOptions={selectedScenarios}
                  onChange={setSelectedScenarios}
                  placeholder='Select scenarios for this avatar'
                  defaultValue={Array.isArray(avatar.scenarios) ? avatar.scenarios.map((scenario) => scenario.id) : []}
                />
                {Array.isArray(selectedScenarios) &&
                  selectedScenarios.length > 0 &&
                  selectedScenarios.map((scenario) => <input key={scenario.id} type='hidden' name='scenarioIds[]' value={scenario.id} />)}
                <p className='text-xs text-gray-500'>Select scenarios this avatar can be used with.</p>
              </Input.Root>

              <Input.Root>
                <Input.Label htmlFor='availability'>Availability</Input.Label>
                <div className='p-1 bg-neutral-05 grid grid-cols-2 rounded-xl'>
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
                    onClick={handlePublishConfirm}
                  >
                    🌐 Public
                  </button>
                </div>
                <p className='text-xs text-gray-500'>
                  Anyone in the system can use public avatars. Once published, you will no longer be able to edit or delete your avatar.
                </p>
              </Input.Root>
              <Modal.Footer className={cn(isExpanded ? 'p-0 mt-auto !pt-0' : 'pb-5 !pt-5')}>
                <Modal.Close asChild>
                  <Button.Root variant='secondary' aria-label='Close' className='w-full'>
                    Cancel
                  </Button.Root>
                </Modal.Close>
                <Button.Root type='submit' className='w-full'>
                  Save Avatar
                </Button.Root>
              </Modal.Footer>
            </div>
          </Modal.Body>

          <input type='hidden' name='published' value={availability === 'public' ? 'true' : 'false'} />
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
