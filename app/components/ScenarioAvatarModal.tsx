import { useFetcher, useNavigate, useRouteLoaderData } from 'react-router';
import * as Modal from '~/components/ui/new-modal';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import type { Avatar, Chat, Scenario, AvatarsPaginated, User } from '~/types';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import { Icons } from './ui/icons';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { fetchWithAuth, fetchPaginatedData } from '~/utils/fetchWithAuth';
import { useDebounceValue } from 'usehooks-ts';

interface ScenarioAvatarModalProps {
  scenario: Scenario;
  children: React.ReactNode;

  chats?: Chat[];
}

const ScenarioAvatarModal: React.FC<ScenarioAvatarModalProps> = ({ scenario, children, chats }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [scenarioAvatars, setScenarioAvatars] = useState<Avatar[]>(scenario.avatars ?? []);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounceValue(searchValue, 300);
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const me = useRouteLoaderData('routes/_main') as User;

  const loadAvatarsWithSearch = async (searchTerm: string = '', isLoadMore: boolean = false) => {
    setLoading(true);
    try {
      const targetCount = isLoadMore ? 8 : 4;
      const pageSize = isLoadMore ? 12 : 4;
      const pageToLoad = isLoadMore ? currentPage + 1 : 1;

      const mineParams = new URLSearchParams();
      mineParams.set('sortBy', 'updatedAt');
      mineParams.set('sortOrder', 'desc');
      mineParams.set('mine', 'true');
      if (searchTerm.trim()) {
        mineParams.set('name', searchTerm.trim());
      }

      const publicParams = new URLSearchParams();
      publicParams.set('sortBy', 'updatedAt');
      publicParams.set('sortOrder', 'desc');
      publicParams.set('published', 'true');
      if (searchTerm.trim()) {
        publicParams.set('name', searchTerm.trim());
      }
      const [mineResult, publicResult] = await Promise.all([
        fetchPaginatedData<AvatarsPaginated>('avatars', mineParams, pageToLoad, pageSize),
        fetchPaginatedData<AvatarsPaginated>('avatars', publicParams, pageToLoad, pageSize),
      ]);

      const allNewAvatars = [...mineResult.data, ...publicResult.data];
      const deduplicatedNewAvatars = allNewAvatars.filter((avatar, index, self) => index === self.findIndex((a) => a.id === avatar.id));

      if (isLoadMore) {
        const existingIds = new Set(avatars.map((a) => a.id));
        const newAvatars = deduplicatedNewAvatars.filter((a) => !existingIds.has(a.id));
        const limitedNewAvatars = newAvatars.slice(0, targetCount);
        setAvatars((prev) => [...prev, ...limitedNewAvatars]);
      } else {
        const limitedAvatars = deduplicatedNewAvatars.slice(0, targetCount);
        setAvatars(limitedAvatars);
      }
      const maxTotalPages = Math.max(mineResult.meta.totalPages, publicResult.meta.totalPages);
      setCurrentPage(pageToLoad);
      setTotalPages(maxTotalPages);
      setInitialized(true);
    } catch (error) {
      console.error('Error loading avatars:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScenarioAvatars = async () => {
    try {
      const response = await fetchWithAuth(`scenarios/${scenario.id}`);
      const fullScenario = await response.json();

      if (fullScenario.avatars) {
        setScenarioAvatars(fullScenario.avatars);
      }
    } catch (error) {
      console.error('Error loading scenario avatars:', error);
    }
  };

  const loadInitialAvatars = async () => {
    if (initialized) return;
    await Promise.all([loadScenarioAvatars(), loadAvatarsWithSearch(debouncedSearchValue)]);
  };

  const loadMoreAvatars = async () => {
    if (loading || currentPage >= totalPages) return;
    await loadAvatarsWithSearch(debouncedSearchValue, true);
  };

  const hasMorePages = currentPage < totalPages;

  if (!scenario?.id) {
    console.warn('ScenarioAvatarModal: Invalid scenario prop provided');
    return null;
  }

  useEffect(() => {
    if (fetcher.state === 'loading') {
      setIsOpen(false);
      setSelectedAvatar(null);
      return;
    }

    if (fetcher.state === 'idle' && fetcher.data?.error) {
      return;
    }
  }, [fetcher.state, fetcher.data]);
  const existingChatsByAvatar = new Map<string, Chat>();
  const scenarioChats = chats?.filter((chat) => chat.scenario.id === scenario.id) ?? scenario.chats;
  scenarioChats.forEach((chat) => {
    if (chat.avatar?.id) {
      existingChatsByAvatar.set(chat.avatar.id, chat);
    }
  });

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
  };

  const handleReset = () => {
    setSelectedAvatar(null);
    setReplaceExisting(false);
    setSearchValue('');
    setAvatars([]);
    setScenarioAvatars(scenario.avatars ?? []);
    setCurrentPage(0);
    setTotalPages(1);
    setInitialized(false);
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  useEffect(() => {
    if (initialized && isOpen) {
      setCurrentPage(0);
      setTotalPages(1);
      loadAvatarsWithSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue]);

  const handleCreateChat = async () => {
    if (selectedAvatar) {
      const existingChat = existingChatsByAvatar.get(selectedAvatar);

      // If there's an existing chat and user wants to continue (not replace)
      if (existingChat && !replaceExisting) {
        navigate(`/chats/${existingChat.id}`);
        setIsOpen(false);
        return;
      }

      // If there's an existing chat and user wants to replace it, delete it first
      if (existingChat && replaceExisting) {
        try {
          const deleteResponse = await fetchWithAuth(`chats/${existingChat.id}`, {
            method: 'DELETE',
          });

          if (!deleteResponse.ok) {
            throw new Error('Failed to delete existing chat');
          }
        } catch (error) {
          console.error('Error deleting existing chat:', error);
        }
      }

      const isAvatarAttached = scenarioAvatars?.some((a) => a.id === selectedAvatar);

      if (!isAvatarAttached) {
        try {
          const currentAvatarIds = scenarioAvatars.map((a) => a.id);
          const updatedAvatarIds = [...currentAvatarIds, selectedAvatar];

          const scenarioFormData = new FormData();

          scenarioFormData.append('scenarioId', scenario.id);
          scenarioFormData.append('name', scenario.name);
          scenarioFormData.append('systemMessage', scenario.systemMessage);
          scenarioFormData.append('chatModelId', scenario.chatModel.id);
          scenarioFormData.append('embeddingModelId', scenario.embeddingModel.id);
          scenarioFormData.append('temperature', scenario.temperature.toString());
          scenarioFormData.append('topP', scenario.topP.toString());
          scenarioFormData.append('frequencyPenalty', scenario.frequencyPenalty.toString());
          scenarioFormData.append('presencePenalty', scenario.presencePenalty.toString());
          if (scenario.reasoningModel) {
            scenarioFormData.append('reasoningModelId', scenario.reasoningModel.id);
          }
          if (scenario.introduction) {
            scenarioFormData.append('introduction', scenario.introduction);
          }
          if (scenario.published !== undefined) {
            scenarioFormData.append('published', scenario.published.toString());
          }
          if (scenario.userGender) {
            scenarioFormData.append('userGender', scenario.userGender);
          }
          if (scenario.avatarGender) {
            scenarioFormData.append('avatarGender', scenario.avatarGender);
          }
          if (scenario.defaultAvatarId) {
            scenarioFormData.append('defaultAvatarId', scenario.defaultAvatarId);
          }

          updatedAvatarIds.forEach((id) => {
            scenarioFormData.append('avatarIds[]', id);
          });

          const updateResponse = await fetchWithAuth(`scenarios/${scenario.id}`, {
            method: 'PATCH',
            body: scenarioFormData,
          });

          if (!updateResponse.ok) {
            console.error('Failed to add avatar to scenario');
          }
        } catch (error) {
          console.error('Error adding avatar to scenario:', error);
        }
      }

      const formData = new FormData();
      formData.append('avatarId', selectedAvatar);
      formData.append('scenarioId', scenario.id);

      fetcher.submit(formData, {
        method: 'POST',
        action: '/chats',
      });
    }
  };

  return (
    <Modal.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          loadInitialAvatars();
        } else {
          handleReset();
        }
      }}
    >
      <Modal.Trigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </Modal.Trigger>
      <Modal.Content className='max-w-2xl'>
        <Modal.Title>Choose Avatar</Modal.Title>
        <Modal.Description>Select an avatar to start chatting with "{scenario.name}".</Modal.Description>

        <Modal.Body className='py-6'>
          <ErrorsBox errors={fetcher.data?.error ? [fetcher.data.error] : undefined} />

          <div className='space-y-4'>
            <div className='bg-neutral-05 p-4 rounded-xl'>
              <h3 className='font-semibold text-base-black mb-2'>Selected Scenario:</h3>
              <div className='flex items-center gap-3'>
                <img
                  src={getPicture(scenario, 'scenarios', false)}
                  srcSet={getPicture(scenario, 'scenarios', true)}
                  alt={scenario.name}
                  className='w-12 h-12 rounded-full object-cover'
                />
                <div>
                  <p className='font-semibold text-base-black'>{scenario.name}</p>
                  {scenario.introduction && <p className='text-sm text-neutral-01 line-clamp-3'>{scenario.introduction}</p>}
                </div>
              </div>

              {selectedAvatar && existingChatsByAvatar.has(selectedAvatar) && (
                <div className='mt-3 space-y-3'>
                  <label className='flex items-start gap-3 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={replaceExisting}
                      onChange={(e) => setReplaceExisting(e.target.checked)}
                      className='mt-1 w-4 h-4 text-blue-600 border-neutral-03 rounded focus:ring-blue-500'
                    />
                    <div className='text-sm'>
                      <p className='font-medium text-base-black'>Replace existing chat</p>
                      <p className='text-neutral-01 mt-1'>Check this to create a new conversation instead of continuing the existing one</p>
                    </div>
                  </label>

                  {replaceExisting && (
                    <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg'>
                      <div className='flex items-start gap-2'>
                        <Icons.warning className='w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0' />
                        <div className='text-sm'>
                          <p className='text-amber-700'>This will permanently delete your existing conversation and start fresh.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className='font-semibold text-base-black mb-3'>Select Avatar:</h3>
              {!initialized && loading ? (
                <div className='p-8 text-center text-neutral-01'>
                  <Icons.loading className='w-6 h-6 animate-spin mx-auto mb-2' />
                  <p>Loading avatars...</p>
                </div>
              ) : (
                <div className='space-y-6 max-h-[480px] overflow-y-auto'>
                  {scenarioAvatars && scenarioAvatars.length > 0 && (
                    <div>
                      <h4 className='text-sm font-medium text-neutral-01 mb-3'>Added to this scenario</h4>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {scenarioAvatars.map((avatar) => {
                          const existingChat = existingChatsByAvatar.get(avatar.id);
                          const isSelected = selectedAvatar === avatar.id;

                          return (
                            <button
                              key={avatar.id}
                              onClick={() => handleAvatarSelect(avatar.id)}
                              className={cn(
                                'flex flex-col gap-2 p-3 rounded-xl border transition-all text-left min-h-[122px]',
                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-neutral-04 hover:border-neutral-03 hover:bg-neutral-05'
                              )}
                            >
                              <div className='flex items-center justify-between'>
                                <h5 className='font-semibold text-base-black'>{avatar.name}</h5>
                                <div className='flex items-center gap-2'>
                                  {avatar.userId === me.id && (
                                    <span className='text-xs bg-neutral-04 text-neutral-01 px-2 py-1 rounded-full'>👤</span>
                                  )}
                                  <img
                                    src={getPicture(avatar, 'avatars', false)}
                                    srcSet={getPicture(avatar, 'avatars', true)}
                                    alt={avatar.name}
                                    className='w-8 h-8 rounded-full object-cover'
                                  />
                                </div>
                              </div>

                              {avatar.shortDesc && <p className='text-sm text-neutral-01 line-clamp-2'>{avatar.shortDesc}</p>}

                              <div className='flex items-center gap-2 text-xs'>
                                {existingChat ? (
                                  <>
                                    <div className='size-2 rounded-full bg-specials-success' />
                                    <span className='text-neutral-01'>Continue chat</span>
                                  </>
                                ) : (
                                  <>
                                    <div className='size-2 rounded-full bg-neutral-04' />
                                    <span className='text-neutral-01'>New conversation</span>
                                  </>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(avatars.length > 0 || searchValue) && (
                    <div>
                      <h4 className='text-sm font-medium text-neutral-01 mb-3'>Other available avatars</h4>

                      <div className='mb-4'>
                        <Input.Root>
                          <Input.Input
                            type='text'
                            placeholder='Search avatars...'
                            className='py-2 pl-10 text-sm'
                            value={searchValue}
                            onChange={handleSearchChange}
                            autoComplete='off'
                          />
                          <Input.Icon as={Icons.search} className='[&_svg]:size-4 peer-focus:bg-transparent!' />
                        </Input.Root>
                      </div>
                      {avatars.length > 0 ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                          {avatars.map((avatar) => {
                            const isSelected = selectedAvatar === avatar.id;
                            const isAttached = scenarioAvatars?.some((a) => a.id === avatar.id);

                            return (
                              <button
                                key={avatar.id}
                                onClick={() => handleAvatarSelect(avatar.id)}
                                className={cn(
                                  'flex flex-col gap-2 p-3 rounded-xl border transition-all text-left min-h-[122px]',
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-neutral-04 hover:border-neutral-03 hover:bg-neutral-05'
                                )}
                              >
                                <div className='flex items-center justify-between'>
                                  <h5 className='font-semibold text-base-black'>{avatar.name}</h5>
                                  <div className='flex items-center gap-2'>
                                    {avatar.userId === me.id && (
                                      <span className='text-xs bg-neutral-04 text-neutral-01 px-2 py-1 rounded-full'>👤</span>
                                    )}
                                    <img
                                      src={getPicture(avatar, 'avatars', false)}
                                      srcSet={getPicture(avatar, 'avatars', true)}
                                      alt={avatar.name}
                                      className='w-8 h-8 rounded-full object-cover'
                                    />
                                  </div>
                                </div>

                                {avatar.shortDesc && <p className='text-sm text-neutral-01 line-clamp-2'>{avatar.shortDesc}</p>}

                                <div className='flex items-center gap-2 text-xs'>
                                  {(() => {
                                    const existingChat = existingChatsByAvatar.get(avatar.id);

                                    if (existingChat) {
                                      return (
                                        <>
                                          <div className='size-2 rounded-full bg-specials-success' />
                                          <span className='text-neutral-01'>Continue chat</span>
                                        </>
                                      );
                                    } else if (isAttached) {
                                      return (
                                        <>
                                          <div className='size-2 rounded-full bg-green-500' />
                                          <span className='text-neutral-01'>Already added to scenario</span>
                                        </>
                                      );
                                    } else {
                                      return (
                                        <>
                                          <div className='size-2 rounded-full bg-blue-500' />
                                          <span className='text-neutral-01'>Will be added to scenario</span>
                                        </>
                                      );
                                    }
                                  })()}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className='text-center py-8 text-neutral-01'>
                          <p>No avatars found matching "{searchValue}"</p>
                          <p className='text-sm mt-1'>Try adjusting your search terms</p>
                        </div>
                      )}

                      {hasMorePages && avatars.length > 0 && (
                        <div className='mt-4 text-center'>
                          <Button.Root onClick={loadMoreAvatars} disabled={loading} variant='secondary' className='w-full'>
                            {loading ? (
                              <>
                                <Icons.loading className='w-4 h-4 animate-spin mr-2' />
                                Loading more avatars...
                              </>
                            ) : (
                              'Load More Avatars'
                            )}
                          </Button.Root>
                        </div>
                      )}
                    </div>
                  )}

                  {(!scenarioAvatars || scenarioAvatars.length === 0) && avatars.length === 0 && !loading && (
                    <div className='p-8 text-center text-neutral-01'>
                      <p>No avatars available.</p>
                      <p className='text-sm mt-2'>Create an avatar first to start chatting.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className='pt-0!'>
          <Modal.Close asChild>
            <Button.Root variant='secondary' className='w-full'>
              Cancel
            </Button.Root>
          </Modal.Close>

          {selectedAvatar ? (
            <Button.Root onClick={handleCreateChat} disabled={fetcher.state !== 'idle'} className='w-full'>
              {fetcher.state === 'submitting' ? (
                <>
                  <Icons.loading className='w-4 h-4 animate-spin' />
                  {existingChatsByAvatar.has(selectedAvatar) && replaceExisting
                    ? 'Replacing Chat...'
                    : existingChatsByAvatar.has(selectedAvatar) && !replaceExisting
                      ? 'Opening Chat...'
                      : 'Creating Chat...'}
                </>
              ) : (
                (() => {
                  const isAvatarAttached = scenarioAvatars?.some((a) => a.id === selectedAvatar);

                  if (existingChatsByAvatar.has(selectedAvatar) && !replaceExisting) {
                    return 'Continue Chat';
                  } else if (existingChatsByAvatar.has(selectedAvatar) && replaceExisting) {
                    return 'Replace Chat';
                  } else if (!isAvatarAttached) {
                    return 'Start Chat';
                  } else {
                    return 'Create Chat';
                  }
                })()
              )}
            </Button.Root>
          ) : (
            <Button.Root disabled className='w-full'>
              Select an Avatar
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default ScenarioAvatarModal;
