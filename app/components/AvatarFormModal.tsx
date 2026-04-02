import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import Multiselect from '~/components/ui/input/multiselect';
import PlayerButton from '~/components/PlayerButton';
import { PATHS } from '~/constants';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import ErrorsBox from '~/components/ui/input/errorsBox';
import * as Modal from '~/components/ui/new-modal';
import type { Avatar, Gender, Scenario, TtsLanguage, TtsVoice } from '~/types';
import { useInfiniteTtsVoices } from '~/hooks/queries/ttsQueries';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { useScenarios } from '~/hooks/queries/scenarioQueries';
import { useUser } from '~/hooks/queries/userQueries';
import { useFillerWords } from '~/hooks/queries/fillerWordQueries';
import { useCreateFillerWord, useDeleteFillerWord } from '~/hooks/queries/fillerWordMutations';
import { AnimatePresence, motion } from 'motion/react';

// TODO: Create all the scenarios or create a page with a new ui.

interface AvatarEditModalProps {
  avatar?: Avatar;
  onSubmit: (data: Record<string, any>) => void;
  isPending: boolean;
  onClose: () => void;
  errors?: Error | null;
}

const AvatarEditModal = ({ avatar, onSubmit, isPending, onClose, errors }: AvatarEditModalProps) => {
  const { data: me } = useUser();

  const { data: scenariosPaginated, isLoading: scenariosLoading } = useScenarios({ mine: 'true', published: 'true', limit: '100' });
  const scenarios = scenariosPaginated?.data || [];

  const [avatarData, setAvatarData] = useState({
    ttsVoice: avatar?.ttsVoice || null,
    scenarios: Array.isArray(avatar?.scenarios) ? avatar.scenarios : [],
    published: avatar?.published || false,
    gender: avatar?.gender || ('' as Gender | ''),
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isVoiceListExpanded, setIsVoiceListExpanded] = useState(false);
  const [voiceGenderFilter, setVoiceGenderFilter] = useState<'All' | Gender>('All');
  const [voiceLanguageFilter, setVoiceLanguageFilter] = useState<'All' | TtsLanguage>('All');
  const isNew = !avatar;

  const voiceQueryParams = {
    ...(voiceGenderFilter !== 'All' && { gender: voiceGenderFilter }),
    ...(voiceLanguageFilter !== 'All' && { language: voiceLanguageFilter }),
  };

  const {
    data: ttsVoicesData,
    isLoading: ttsVoicesLoading,
    isFetching: isFetchingVoices,
    fetchNextPage: fetchNextVoices,
    hasNextPage: hasNextVoicesPage,
    isFetchingNextPage: isFetchingNextVoices,
    isError: isVoicesError,
  } = useInfiniteTtsVoices(voiceQueryParams);

  const voices = useMemo(() => ttsVoicesData?.pages.flatMap((page) => page.data) || [], [ttsVoicesData]);

  const [voiceInfiniteRef] = useInfiniteScroll({
    loading: isFetchingVoices || isFetchingNextVoices,
    hasNextPage: !!hasNextVoicesPage,
    onLoadMore: fetchNextVoices,
    disabled: !!isVoicesError,
  });

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

  const languageFlags: Record<string, string> = {
    en: '🇬🇧',
    de: '🇩🇪',
    fr: '🇫🇷',
    es: '🇪🇸',
    it: '🇮🇹',
    pt: '🇵🇹',
    ru: '🇷🇺',
    ja: '🇯🇵',
    zh: '🇨🇳',
    ko: '🇰🇷',
    multilingual: '🌐',
  };
  const availableLanguages = Object.keys(languageFlags) as TtsLanguage[];


  const handlePublishConfirm = () => {
    updateAvatarData('published', true);
  };

  const handleClose = () => {
    onClose && onClose();
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Collect scenarioIds from the array field
    const scenarioIds = formData.getAll('scenarioIds[]').map(String);
    // Build plain object from scalar fields
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key === 'scenarioIds[]' || key === 'avatarId' || key === 'picture') return;
      data[key] = value;
    });
    if (scenarioIds.length > 0) data.scenarioIds = scenarioIds;
    // Convert boolean strings
    if (data.published === 'true') data.published = true;
    if (data.published === 'false') data.published = false;
    if (data.recommended === 'true') data.recommended = true;
    if (data.recommended === 'false') data.recommended = false;
    onSubmit(data);
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
        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden -mx-8 px-8'>
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

              <Textarea.Root>
                <Textarea.Label htmlFor='introduction'>Introduction</Textarea.Label>
                <Textarea.Wrapper>
                  <Textarea.Textarea
                    className='w-full border border-neutral-04 py-3.5 px-3 text-base-black scrollbar-medium'
                    id='introduction'
                    name='introduction'
                    placeholder='A short introduction line for audio generation'
                    defaultValue={avatar?.introduction ?? ''}
                    rows={3}
                  />
                </Textarea.Wrapper>
              </Textarea.Root>

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
                        key='voice-filter'
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
                            {languageFlags[lang] ?? lang.toUpperCase()}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!isVoiceListExpanded && avatarData.ttsVoice && (
                  <div className='voice-gradient py-3 px-4 rounded-xl flex items-center gap-4 shadow-regular'>
                    {avatarData.ttsVoice.audio && <PlayerButton
                      variant='white'
                      className='shrink-0 shadow-bottom-level-1'
                      audioSrc={PATHS.audio(avatarData.ttsVoice.audio.id)}
                    />}
                    <div className='flex flex-col gap-1 flex-1 min-w-0'>
                      <p className='text-body-lg font-semibold text-base-black truncate'>{avatarData.ttsVoice.name}</p>
                      <span className='text-body-md text-neutral-01 truncate flex items-center gap-1.5'>
                        {avatarData.ttsVoice.ttsProvider?.picture && (
                          <img
                            src={getPicture(avatarData.ttsVoice.ttsProvider, 'tts-providers', false)}
                            srcSet={getPicture(avatarData.ttsVoice.ttsProvider, 'tts-providers', true)}
                            alt={avatarData.ttsVoice.ttsProvider?.name}
                            className='size-4 object-cover rounded'
                          />
                        )}
                        {avatarData.ttsVoice.ttsProvider?.name || 'Voice Provider'}
                        {avatarData.ttsVoice.ttsProvider?.dollarPerCharacter != null && (
                          <>
                            <span className='text-neutral-02'>·</span>
                            <span className='text-neutral-02'>${avatarData.ttsVoice.ttsProvider.dollarPerCharacter}/char</span>
                          </>
                        )}
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
                          {voices.length === 0 && !ttsVoicesLoading ? (
                            <div className='py-8 text-center'>
                              <p className='text-body-md text-neutral-01'>No voices found</p>
                            </div>
                          ) : (
                            <>
                              {voices.map((voice, index) => {
                                const isSelected = avatarData.ttsVoice?.id === voice.id;
                                return (
                                  <motion.button
                                    key={voice.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.15, delay: Math.min(index, 10) * 0.02 }}
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
                                    {voice.audio && <PlayerButton
                                      variant='white'
                                      className='shrink-0 shadow-bottom-level-1'
                                      audioSrc={PATHS.audio(voice.audio.id)}
                                    />}
                                    <div className='flex flex-col gap-1 flex-1 text-left min-w-0'>
                                      <p className='text-body-lg font-semibold text-base-black line-clamp-1'>{voice.name}</p>
                                      <span className='text-body-md text-neutral-01 capitalize flex items-center gap-1.5'>
                                        <img
                                          src={getPicture(voice.ttsProvider, 'tts-providers', false)}
                                          srcSet={getPicture(voice.ttsProvider, 'tts-providers', true)}
                                          alt={voice.ttsProvider.name}
                                          className='size-4 object-cover rounded'
                                        />
                                        {voice.ttsProvider.name}
                                        <span className='text-neutral-02'>·</span>
                                        <span className='text-neutral-02'>${voice.ttsProvider.dollarPerCharacter}/char</span>
                                      </span>
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
                              })}
                              {isFetchingNextVoices && (
                                <div className='text-center py-2'>
                                  <Icons.loading className='size-4 animate-spin inline-block' />
                                </div>
                              )}
                              {hasNextVoicesPage && !isFetchingNextVoices && <div ref={voiceInfiniteRef} className='h-4' />}
                            </>
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
              {fw.audio && (
                <PlayerButton
                  variant='white'
                  className='size-6 shadow-none'
                  audioSrc={PATHS.audio(fw.audio.id)}
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
