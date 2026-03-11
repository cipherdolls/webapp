import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import Multiselect from '~/components/ui/input/multiselect';
import PlayerButton from '~/components/PlayerButton';
import { PATHS } from '~/constants';
import { useRef, useState, useMemo, useEffect } from 'react';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import ErrorsBox from '~/components/ui/input/errorsBox';
import * as Modal from '~/components/ui/new-modal';
import type { Avatar, Gender, Scenario, TtsLanguage, TtsVoice } from '~/types';
import { useTtsVoices } from '~/hooks/queries/ttsQueries';
import { useScenarios } from '~/hooks/queries/scenarioQueries';
import { useUser } from '~/hooks/queries/userQueries';
import { useFillerWords } from '~/hooks/queries/fillerWordQueries';
import { useCreateFillerWord, useDeleteFillerWord } from '~/hooks/queries/fillerWordMutations';
import { AnimatePresence, motion } from 'motion/react';

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

  const { data: scenariosPaginated, isLoading: scenariosLoading } = useScenarios({ mine: 'true', published: 'true', limit: '100' });
  const { data: ttsVoices, isLoading: ttsVoicesLoading } = useTtsVoices();

  const scenarios = scenariosPaginated?.data || [];
  const voices = ttsVoices || [];

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
  const [isVoiceListExpanded, setIsVoiceListExpanded] = useState(false);
  const [voiceGenderFilter, setVoiceGenderFilter] = useState<'All' | Gender>('All');
  const [voiceLanguageFilter, setVoiceLanguageFilter] = useState<'All' | TtsLanguage>('All');
  const isNew = !avatar;

  // Set default voice when voices are loaded
  useEffect(() => {
    if (!avatar?.ttsVoice && voices.length > 0 && !avatarData.ttsVoice) {
      updateAvatarData('ttsVoice', voices[0]);
    }
  }, [voices, avatar?.ttsVoice]);

  const updateAvatarData = (field: keyof typeof avatarData, value: any) => {
    setAvatarData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVoiceChange = (voice: TtsVoice) => {
    updateAvatarData('ttsVoice', voice);
  };

  const availableLanguages = useMemo(() => {
    const langs = new Set(voices.map((v) => v.language).filter(Boolean));
    return Array.from(langs) as TtsLanguage[];
  }, [voices]);

  const filteredVoices = useMemo(() => {
    return voices.filter((voice) => {
      if (voiceGenderFilter !== 'All' && voice.gender !== voiceGenderFilter) return false;
      if (voiceLanguageFilter !== 'All' && voice.language !== voiceLanguageFilter) return false;
      return true;
    });
  }, [voices, voiceGenderFilter, voiceLanguageFilter]);

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
                      <div className='flex items-center justify-center bg-base-white shadow-bottom-level-2 rounded-full overflow-hidden'>
                        {avatarData.picture !== null && (
                          <button
                            type='button'
                            className=' py-2 px-5 relative z-10 duration-300 transition-opacity hover:opacity-60'
                            onClick={handleTrashClick}
                          >
                            <Icons.trash className='text-black' />
                          </button>
                        )}
                        {(avatarData.picture || avatar?.picture) && <div className='h-6 w-px bg-neutral-04' />}
                        <button
                          type='button'
                          className='py-2 px-5 relative z-10 duration-300 transition-opacity hover:opacity-60'
                          onClick={() => fileInputRef.current?.click()}
                        >
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
                <div className='flex items-center justify-between min-h-9'>
                  <Input.Label htmlFor='voice' className='mb-0'>
                    Voice
                  </Input.Label>

                  <AnimatePresence mode='wait'>
                    {!isVoiceListExpanded ? (
                      <motion.button
                        key='change-button'
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        type='button'
                        onClick={() => setIsVoiceListExpanded(true)}
                        className='text-body-sm font-semibold text-neutral-01 hover:text-base-black transition-colors'
                      >
                        Change
                      </motion.button>
                    ) : (
                      <motion.div
                        key='gender-filter'
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className='flex items-center gap-1 p-1 bg-neutral-05 rounded-lg'
                      >
                        <button
                          type='button'
                          className={cn(
                            'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors',
                            voiceGenderFilter === 'All' ? 'bg-white text-base-black' : 'text-neutral-01'
                          )}
                          onClick={() => setVoiceGenderFilter('All')}
                        >
                          All
                        </button>
                        <button
                          type='button'
                          className={cn(
                            'px-2 py-1.5 text-xs font-semibold rounded-md transition-colors',
                            voiceGenderFilter === 'Female' ? 'bg-white text-base-black' : 'text-neutral-01'
                          )}
                          onClick={() => setVoiceGenderFilter('Female')}
                        >
                          👩🏻
                        </button>
                        <button
                          type='button'
                          className={cn(
                            'px-2 py-1.5 text-xs font-semibold rounded-md transition-colors',
                            voiceGenderFilter === 'Male' ? 'bg-white text-base-black' : 'text-neutral-01'
                          )}
                          onClick={() => setVoiceGenderFilter('Male')}
                        >
                          🧔🏻‍♂️
                        </button>
                        {availableLanguages.length > 1 && (
                          <>
                            <div className='w-px h-4 bg-neutral-03' />
                            {availableLanguages.map((lang) => (
                              <button
                                key={lang}
                                type='button'
                                className={cn(
                                  'px-2 py-1.5 text-xs font-semibold rounded-md transition-colors',
                                  voiceLanguageFilter === lang ? 'bg-white text-base-black' : 'text-neutral-01'
                                )}
                                onClick={() => setVoiceLanguageFilter(voiceLanguageFilter === lang ? 'All' : lang)}
                              >
                                {lang === 'multilingual' ? 'Multi' : lang.toUpperCase()}
                              </button>
                            ))}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!isVoiceListExpanded && avatarData.ttsVoice && (
                  <div className='voice-gradient py-3 px-4 rounded-xl flex items-center gap-4 shadow-regular'>
                    <PlayerButton
                      variant='white'
                      className='shrink-0 shadow-bottom-level-1'
                      audioSrc={PATHS.ttsVoice(avatarData.ttsVoice.id)}
                    />
                    <div className='flex flex-col gap-1 flex-1 min-w-0'>
                      <p className='text-body-lg font-semibold text-base-black truncate'>{avatarData.ttsVoice.name}</p>
                      <span className='text-body-md text-neutral-01 truncate'>
                        {avatarData.ttsVoice.ttsProvider?.name || 'Voice Provider'}
                      </span>
                    </div>
                  </div>
                )}

                {!isVoiceListExpanded && !avatarData.ttsVoice && (
                  <div className='py-8 text-center bg-neutral-05 rounded-xl'>
                    <p className='text-body-md text-neutral-01'>No voice selected</p>
                  </div>
                )}

                <AnimatePresence mode='wait' initial={false}>

                  {isVoiceListExpanded && (
                    <motion.div
                      key='voice-list'
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className='overflow-hidden'
                    >
                      <div className='space-y-2'>
                        <div className='max-h-[280px] overflow-y-auto scrollbar-medium space-y-2'>
                          {filteredVoices.length === 0 ? (
                            <div className='py-8 text-center'>
                              <p className='text-body-md text-neutral-01'>No voices found for {voiceGenderFilter} gender</p>
                            </div>
                          ) : (
                            filteredVoices.map((voice, index) => {
                              const isSelected = avatarData.ttsVoice?.id === voice.id;
                              return (
                                <motion.button
                                  key={voice.id}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.15, delay: index * 0.02 }}
                                  type='button'
                                  className={cn(
                                    'w-full py-3 px-4 rounded-xl flex items-center gap-4 shadow-regular transition-all',
                                    isSelected
                                      ? voice.gender === 'Male'
                                        ? 'male-gradient'
                                        : voice.gender === 'Female'
                                          ? 'female-gradient'
                                          : 'voice-gradient'
                                      : 'bg-neutral-05 hover:bg-neutral-04'
                                  )}
                                  onClick={() => handleVoiceChange(voice)}
                                >
                                  <PlayerButton
                                    variant='white'
                                    className='shrink-0 shadow-bottom-level-1'
                                    audioSrc={PATHS.ttsVoice(voice.id)}
                                  />
                                  <div className='flex flex-col gap-1 flex-1 text-left min-w-0'>
                                    <p className='text-body-lg font-semibold text-base-black line-clamp-1'>{voice.name}</p>
                                    <span className='text-body-md text-neutral-01 capitalize'>{voice.ttsProvider.name}</span>
                                  </div>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                      className='shrink-0'
                                    >
                                      <Icons.check className='text-base-black' />
                                    </motion.div>
                                  )}
                                </motion.button>
                              );
                            })
                          )}
                        </div>

                        <button
                          type='button'
                          onClick={() => setIsVoiceListExpanded(false)}
                          className='w-full py-3 px-4 text-body-sm font-semibold text-base-black bg-neutral-05 hover:bg-neutral-04 rounded-xl transition-colors'
                        >
                          Done
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {avatarData.ttsVoice && <input type='hidden' name='ttsVoiceId' value={avatarData.ttsVoice.id} />}

                <p className='text-xs text-gray-500 mt-2'>Select a voice for text-to-speech functionality.</p>
              </Input.Root>

              <Input.Root>
                <Input.Label htmlFor='scenarios'>Scenarios</Input.Label>
                <Multiselect<Scenario>
                  userId={me?.id || ''}
                  options={scenarios}
                  selectedOptions={avatarData.scenarios}
                  onChange={(scenarios) => updateAvatarData('scenarios', scenarios)}
                  placeholder='Select scenarios for this avatar'
                  forType='scenarios'
                  defaultValue={Array.isArray(avatar?.scenarios) ? avatar.scenarios.map((scenario) => scenario.id) : []}
                />
                {Array.isArray(avatarData.scenarios) &&
                  avatarData.scenarios.length > 0 &&
                  avatarData.scenarios.map((scenario) => (
                    <input key={scenario.id} type='hidden' name='scenarioIds[]' value={scenario.id} />
                  ))}
                <p className='text-xs text-gray-500'>Select scenarios this avatar can be used with.</p>
              </Input.Root>

              {avatar?.id && <FillerWordsSection avatarId={avatar.id} />}

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

function FillerWordsSection({ avatarId }: { avatarId: string }) {
  const [newWord, setNewWord] = useState('');
  const { data: fillerWordsPaginated } = useFillerWords(avatarId);
  const { mutate: createFillerWord, isPending: isCreating } = useCreateFillerWord();
  const { mutate: deleteFillerWord } = useDeleteFillerWord();

  const fillerWords = fillerWordsPaginated?.data || [];

  const handleAdd = () => {
    const text = newWord.trim();
    if (!text) return;
    createFillerWord({ text, avatarId }, { onSuccess: () => setNewWord('') });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Input.Root>
      <Input.Label>Filler Words</Input.Label>
      <div className='flex gap-2'>
        <Input.Input
          className='text-base-black border border-neutral-04 py-3.5 px-3 flex-1'
          type='text'
          placeholder='e.g. okay, yeah, so...'
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button.Root type='button' onClick={handleAdd} disabled={isCreating || !newWord.trim()} className='shrink-0'>
          Add
        </Button.Root>
      </div>
      {fillerWords.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-2'>
          {fillerWords.map((fw) => (
            <span
              key={fw.id}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-05 rounded-lg text-body-sm font-medium'
            >
              {fw.fileName && (
                <PlayerButton
                  variant='white'
                  className='size-6 shadow-none'
                  audioSrc={PATHS.fillerWordAudio(fw.id)}
                />
              )}
              {fw.text}
              <button
                type='button'
                onClick={() => deleteFillerWord({ fillerWordId: fw.id, avatarId })}
                className='text-neutral-01 hover:text-base-black transition-colors'
              >
                <Icons.close className='w-3.5 h-3.5' />
              </button>
            </span>
          ))}
        </div>
      )}
      <p className='text-xs text-gray-500'>Short words played as audio feedback while waiting for the AI response.</p>
    </Input.Root>
  );
}

export default AvatarEditModal;
