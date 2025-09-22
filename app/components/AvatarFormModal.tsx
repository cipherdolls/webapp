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
import type { Avatar, Gender, Scenario, TtsVoice } from '~/types';
import { useTtsVoices } from '~/hooks/queries/ttsQueries';
import { useScenarios } from '~/hooks/queries/scenarioQueries';
import { useUser } from '~/hooks/queries/userQueries';

// TODO: Create all the scenarios or create a page with a new ui. 

interface AvatarEditModalProps {
  avatar?: Avatar;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  onClose: () => void;  
  errors?: Error | null;
}

const AvatarEditModal = ({ avatar, onSubmit, isPending, onClose, errors }: AvatarEditModalProps) => {

  const { data: me } = useUser();
  
  const { data: scenariosPaginated, isLoading: scenariosLoading } = useScenarios({mine: 'true', published: 'true', limit: '100'});
  const { data: ttsVoices, isLoading: ttsVoicesLoading } = useTtsVoices();

  const scenarios = scenariosPaginated?.data || [];
  const voices = ttsVoices || []


  const [avatarData, setAvatarData] = useState({
    ttsVoice: avatar?.ttsVoice || (voices && voices.length > 0 ? voices[0] : null),
    picture: avatar?.picture ?? null,
    scenarios: Array.isArray(avatar?.scenarios) ? avatar.scenarios : [],
    published: avatar?.published || false,
    gender: avatar?.gender || ('' as Gender | ''),
  });

  const [preventFileOpen, setPreventFileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const isNew = !avatar;

  const updateAvatarData = (field: keyof typeof avatarData, value: any) => {
    setAvatarData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVoiceChange = (voice: TtsVoice) => {
    updateAvatarData('ttsVoice', voice);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      updateAvatarData('picture', imageUrl);
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
    updateAvatarData('picture', null);

    setPreventFileOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePublishConfirm = () => {
    updateAvatarData('published', true);
  };

  const handleClose = () => {
    onClose && onClose();
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  }


  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content
        className={cn(
          'overflow-y-auto flex flex-col scrollbar-medium ',
          isExpanded ? 'max-w-none w-[90vw] h-screen' : 'max-h-[calc(100vh-104px)]'
        )}
      >
        <div className='flex items-center justify-between pb-4'>
          <Modal.Title>{avatar ? 'Edit Avatar' : 'Create Avatar'}</Modal.Title>
          <button
            type='button'
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block'
            title={isExpanded ? 'Collapse modal' : 'Expand modal'}
          >
            <Icons.expand />
          </button>
        </div>
        <Modal.Description className='sr-only'>{avatar ? 'Edit avatar' : 'Create new avatar'}</Modal.Description>
        <form onSubmit={handleSubmit} encType='multipart/form-data' className='flex flex-col flex-1 overflow-hidden -mx-8 px-8'>
          <Modal.Body
            className={cn(
              'flex gap-4 md:gap-6 flex-1 overflow-auto scrollbar-medium -mx-8 px-8 [scrollbar-gutter:stable]',
              isExpanded ? 'flex-row' : 'flex-col'
            )}
          >
            {avatar?.id && <input type='hidden' name='avatarId' defaultValue={avatar?.id} />}

            {isExpanded && (
              <div className='flex-1 flex flex-col pb-0.5'>
                <Textarea.Root className='h-full'>
                  <Textarea.Label htmlFor='character'>Character</Textarea.Label>
                  <Textarea.Wrapper className='flex-1'>
                    <Textarea.Textarea
                      id='character'
                      name='character'
                      className='block w-full border border-neutral-04 py-3.5 px-3 text-base-black h-full resize-none scrollbar-medium max-h-full'
                      placeholder='Describe your avatar'
                      defaultValue={avatar?.character}
                      isExpanded={isExpanded}
                    />
                  </Textarea.Wrapper>
                </Textarea.Root>
              </div>
            )}

            <div
              className={cn(
                'flex flex-col gap-4 md:gap-6  ',
                isExpanded ? 'flex-1 pb-5 h-full -mx-4 px-4 overflow-auto scrollbar-medium' : 'w-full'
              )}
            >
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
                    {avatarData.picture !== null ? (
                      <div className='size-full'>
                        <img
                          src={
                            avatarData.picture.startsWith('blob:')
                              ? avatarData.picture
                              : avatar
                                ? getPicture(avatar, 'avatars', false)
                                : '/default-avatar.png'
                          }
                          srcSet={!avatarData.picture.startsWith('blob:') && avatar ? getPicture(avatar, 'avatars', true) : undefined}
                          alt={avatar?.name || 'Avatar'}
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
                          (avatarData.picture || avatar?.picture) && 'divide-x divide-neutral-04 gap-4'
                        )}
                      >
                        {avatarData.picture !== null && (
                          <button type='button' className='pr-4 relative z-10' onClick={handleTrashClick}>
                            <Icons.trash className='text-black' />
                          </button>
                        )}
                        <Icons.fileUpload className='cursor-pointer' onClick={() => fileInputRef.current?.click()} />
                      </div>
                    </div>
                  </div>

                  <div className='absolute z-10 bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2'>
                    <div className='flex items-center justify-between w-full'>
                      <div
                        className='flex items-center justify-center bg-base-white shadow-bottom-level-2 rounded-full overflow-hidden'
                      >
                        {avatarData.picture !== null && (
                          <button type='button' className=' py-2 px-5 relative z-10 duration-300 transition-opacity hover:opacity-60' onClick={handleTrashClick}>
                            <Icons.trash className='text-black' />
                          </button>
                        )}
                        {(avatarData.picture || avatar?.picture)  &&
                          <div className='h-6 w-px bg-neutral-04'/>
                        }
                        <button type='button' className='py-2 px-5 relative z-10 duration-300 transition-opacity hover:opacity-60' onClick={() => fileInputRef.current?.click()} >
                          <Icons.fileUpload />
                        </button>
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
                    defaultValue={avatar?.name}
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
                    defaultValue={avatar?.shortDesc}
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
                      defaultValue={avatar?.character}
                      rows={5}
                    />
                  </Textarea.Wrapper>
                  <p className='text-xs text-gray-500'>Detailed character description.</p>
                </Textarea.Root>
              )}

              <Input.Root>
                <Input.Label htmlFor='gender'>Gender</Input.Label>
                <div className='p-1 bg-neutral-05 grid grid-cols-2 rounded-xl'>
                  <button
                    type='button'
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      avatarData.gender === 'Female' ? 'bg-white' : 'bg-transparent'
                    )}
                    onClick={() => updateAvatarData('gender', 'Female')}
                  >
                    👩🏻 Female
                  </button>
                  <button
                    type='button'
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      avatarData.gender === 'Male' ? 'bg-white' : 'bg-transparent'
                    )}
                    onClick={() => updateAvatarData('gender', 'Male')}
                  >
                    🧔🏻‍♂ Male
                  </button>
                </div>
                <input type='hidden' name='gender' value={avatarData.gender} />
                <p className='text-xs text-gray-500'>Select the gender for this avatar.</p>
              </Input.Root>

              <Input.Root>
                <Input.Label htmlFor='voice'>Voice</Input.Label>
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-sm text-gray-500'>Select a voice for the avatar</span>
                  <SelectVoiceModal ttsVoices={voices} selectedVoice={avatarData.ttsVoice} onVoiceChange={handleVoiceChange} />
                </div>
                {avatarData.ttsVoice && (
                  <div className='voice-gradient py-3 px-4 rounded-xl flex items-center gap-4 shadow-regular'>
                    <PlayerButton
                      variant='white'
                      className='shrink-0 shadow-bottom-level-1'
                      audioSrc={PATHS.ttsVoice(avatarData.ttsVoice.id)}
                    />
                    <div className='flex flex-col gap-1'>
                      <p className='text-body-lg font-semibold text-base-black'>{avatarData.ttsVoice.name}</p>
                      <span className='text-body-md text-neutral-01'>{avatarData.ttsVoice.ttsProvider?.name || 'Voice Provider'}</span>
                      <input type='hidden' name='ttsVoiceId' value={avatarData.ttsVoice.id} />
                    </div>
                  </div>
                )}
              </Input.Root>

              <Input.Root>
                <Input.Label htmlFor='scenarios'>Scenarios</Input.Label>
                <Multiselect<Scenario>
                  userId={me?.id || ''}
                  options={scenarios}
                  selectedOptions={avatarData.scenarios}
                  onChange={(scenarios) => updateAvatarData('scenarios', scenarios)}
                  placeholder='Select scenarios for this avatar'
                  defaultValue={Array.isArray(avatar?.scenarios) ? avatar.scenarios.map((scenario) => scenario.id) : []}
                />
                {Array.isArray(avatarData.scenarios) &&
                  avatarData.scenarios.length > 0 &&
                  avatarData.scenarios.map((scenario) => (
                    <input key={scenario.id} type='hidden' name='scenarioIds[]' value={scenario.id} />
                  ))}
                <p className='text-xs text-gray-500'>Select scenarios this avatar can be used with.</p>
              </Input.Root>

              <Input.Root>
                <Input.Label htmlFor='availability'>Availability</Input.Label>
                <div className='p-1 bg-neutral-05 grid grid-cols-2 rounded-xl'>
                  <button
                    type='button'
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      !avatarData.published ? 'bg-white' : 'bg-transparent'
                    )}
                    onClick={() => updateAvatarData('published', false)}
                  >
                    🔒 Private
                  </button>

                  <button
                    type='button'
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      avatarData.published ? 'bg-white' : 'bg-transparent'
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
            </div>
          </Modal.Body>
          <ErrorsBox errors={errors} className='mt-3' />
          <Modal.Footer className={cn('flex-shrink-0 pt-7')}>
            <Modal.Close asChild>
              <Button.Root variant='secondary' aria-label='Close' className={'w-full'}>
                Cancel
              </Button.Root>
            </Modal.Close>
            <Button.Root type='submit' className={'w-full'}>
              {isNew ? 'Create Avatar' : 'Save Avatar'}
            </Button.Root>
          </Modal.Footer>

          <input type='hidden' name='published' value={avatarData.published ? 'true' : 'false'} />
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

export default AvatarEditModal;
