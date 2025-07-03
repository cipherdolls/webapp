import { redirect, useFetcher, useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.avatars.new';
import type { Scenario, TtsVoice } from '~/types';
import { useRef, useState } from 'react';
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
import * as Modal from '~/components/ui/new-modal';
import ErrorsBox from '~/components/ui/input/errorsBox';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatars' }];
}

const genreOptions = [
  {
    value: 'Male',
    label: 'Male',
  },
  {
    value: 'Female',
    label: 'Female',
  },
];

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
      const responseData = await res.json();
      return {
        errors: responseData.message || 'Request failed',
      };
    }

    await res.json();
    return redirect(`/avatars`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function AvatarNew({ loaderData }: Route.ComponentProps) {
  const { ttsVoices, scenarios }: { ttsVoices: TtsVoice[]; scenarios: Scenario[] } = loaderData;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<TtsVoice | null>(ttsVoices && ttsVoices.length > 0 ? ttsVoices[0] : null);
  const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>([]);
  const [availability, setAvailability] = useState<'private' | 'public'>('private');
  const [gender, setGender] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preventFileOpen, setPreventFileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const errors = fetcher.data?.errors;

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
    navigate('/avatars');
  };

  const handleVoiceChange = (voice: TtsVoice) => {
    setSelectedVoice(voice);
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
          <div className='flex flex-col gap-2'>
            <Modal.Title>Create new avatar</Modal.Title>
            <div className={cn('w-full', !isExpanded && 'hidden')}>
              <ErrorsBox errors={errors} />
            </div>
          </div>
          <button
            type='button'
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block'
            title={isExpanded ? 'Collapse modal' : 'Expand modal'}
          >
            <Icons.expand />
          </button>
        </div>
        <Modal.Description className='sr-only'>Create new avatar</Modal.Description>
        <fetcher.Form method='post' encType='multipart/form-data' className='w-full flex flex-col mt-[18px] h-full'>
          <Modal.Body className={cn('flex gap-4 md:gap-6 flex-1', isExpanded ? 'flex-col md:flex-row ' : 'flex-col')}>
            <div className={cn('w-full', isExpanded && 'hidden')}>
              <ErrorsBox errors={errors} />
            </div>

            {isExpanded && (
              <div className='flex-1 flex-col pb-8 gap-6 hidden md:flex'>
                <Textarea.Root className='h-full'>
                  <Textarea.Label htmlFor='character'>Character</Textarea.Label>
                  <Textarea.Wrapper className='flex-1'>
                    <Textarea.Textarea
                      id='character'
                      name='character'
                      className='w-full border border-neutral-04 py-3.5 px-3 text-base-black h-full resize-none scrollbar-medium max-h-full'
                      placeholder='Describe your avatar'
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
                        <span className='text-body-md text-neutral-01'>{selectedVoice.ttsProvider.name}</span>
                        <input type='hidden' name='ttsVoiceId' value={selectedVoice.id} />
                      </div>
                    </div>
                  )}
                </Input.Root>
              </div>
            )}

            <div className={cn('flex flex-col gap-4 md:gap-6', isExpanded ? 'flex-1 pb-8' : 'w-full')}>
              <div className={cn('flex flex-col items-center justify-center', isExpanded ? 'mb-5' : 'mb-10')}>
                <div className='relative'>
                  <label
                    className={cn(
                      'bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative',
                      isExpanded ? 'size-32' : 'size-40'
                    )}
                    onClick={handleLabelClick}
                  >
                    <input
                      ref={fileInputRef}
                      className='hidden'
                      type='file'
                      name='picture'
                      id='picture'
                      accept='image/*'
                      onChange={handleImageChange}
                    />
                    {selectedImage ? (
                      <div className='size-full'>
                        <img src={selectedImage} alt='Selected avatar' className='size-full object-cover rounded-lg' />
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

              <div className='grid grid-cols-1 gap-4'>
                <Input.Root>
                  <Input.Label htmlFor='name'>Name</Input.Label>
                  <Input.Input id='name' name='name' type='text' placeholder='Add a name' />
                </Input.Root>
                <Input.Root>
                  <Input.Label htmlFor='shortDesc'>Short Description</Input.Label>
                  <Input.Input id='shortDesc' name='shortDesc' type='text' placeholder='Fun, smart, sweet etc.' />
                </Input.Root>
              </div>

              {!isExpanded && (
                <Textarea.Root>
                  <Textarea.Label htmlFor='character'>Character</Textarea.Label>
                  <Textarea.Wrapper>
                    <Textarea.Textarea id='character' name='character' placeholder='Describe your avatar' rows={5} />
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
                        <span className='text-body-md text-neutral-01'>{selectedVoice.ttsProvider.name}</span>
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
                  options={scenarios}
                  selectedOptions={selectedScenarios}
                  onChange={setSelectedScenarios}
                  placeholder='Select scenarios for this avatar'
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
                    onClick={() => setAvailability('public')}
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
                  Create Avatar
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
