import { useFetcher, useNavigate, useRouteLoaderData } from 'react-router';
import * as Modal from '~/components/ui/new-modal';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import type { Avatar, Chat, Scenario, ScenariosPaginated, User } from '~/types';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import { Icons } from './ui/icons';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { fetchWithAuth, fetchPaginatedData } from '~/utils/fetchWithAuth';
import { useDebounceValue } from 'usehooks-ts';

interface AvatarScenarioModalProps {
  avatar: Avatar;
  children: React.ReactNode;
  chats?: Chat[];
}

const AvatarScenarioModal: React.FC<AvatarScenarioModalProps> = ({ avatar, children, chats }) => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounceValue(searchValue, 300);
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const me = useRouteLoaderData('routes/_main') as User;

  const loadScenariosWithSearch = async (searchTerm: string = '', isLoadMore: boolean = false) => {
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
        fetchPaginatedData<ScenariosPaginated>('scenarios', mineParams, pageToLoad, pageSize),
        fetchPaginatedData<ScenariosPaginated>('scenarios', publicParams, pageToLoad, pageSize),
      ]);

      const allNewScenarios = [...mineResult.data, ...publicResult.data];
      let deduplicatedNewScenarios = allNewScenarios.filter(
        (scenario, index, self) => index === self.findIndex((s) => s.id === scenario.id)
      );

      // Ensure scenarios with existing chats are always included
      if (!isLoadMore) {
        const existingChatsByScenario = new Map<string, Chat>();
        const avatarChats = chats?.filter((chat: Chat) => chat.avatar.id === avatar.id) ?? avatar.chats ?? [];
        avatarChats.forEach((chat: Chat) => {
          if (chat?.scenario?.id) {
            existingChatsByScenario.set(chat.scenario.id, chat);
          }
        });

        const chatScenarios = Array.from(existingChatsByScenario.values()).map((chat) => chat.scenario);
        const chatScenariosNotInResults = chatScenarios.filter(
          (scenario) => !deduplicatedNewScenarios.some((s) => s.id === scenario.id) && !avatar.scenarios?.some((s) => s.id === scenario.id)
        );

        deduplicatedNewScenarios = [...deduplicatedNewScenarios, ...chatScenariosNotInResults];
      }

      if (isLoadMore) {
        const existingIds = new Set(scenarios.map((s) => s.id));
        const newScenarios = deduplicatedNewScenarios.filter((s) => !existingIds.has(s.id));
        const limitedNewScenarios = newScenarios.slice(0, targetCount);
        setScenarios((prev) => [...prev, ...limitedNewScenarios]);
      } else {
        const existingChatsByScenario = new Map<string, Chat>();
        const avatarChats = chats?.filter((chat: Chat) => chat.avatar.id === avatar.id) ?? avatar.chats ?? [];
        avatarChats.forEach((chat: Chat) => {
          if (chat?.scenario?.id) {
            existingChatsByScenario.set(chat.scenario.id, chat);
          }
        });

        const scenariosWithChats = deduplicatedNewScenarios.filter((s) => existingChatsByScenario.has(s.id));
        const scenariosWithoutChats = deduplicatedNewScenarios.filter((s) => !existingChatsByScenario.has(s.id));

        const remainingSlots = Math.max(0, targetCount - scenariosWithChats.length);
        const limitedScenariosWithoutChats = scenariosWithoutChats.slice(0, remainingSlots);

        const finalScenarios = [...scenariosWithChats, ...limitedScenariosWithoutChats];
        setScenarios(finalScenarios);
      }
      const maxTotalPages = Math.max(mineResult.meta.totalPages, publicResult.meta.totalPages);
      setCurrentPage(pageToLoad);
      setTotalPages(maxTotalPages);
      setInitialized(true);
    } catch (error) {
      console.error('Error loading scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInitialScenarios = async () => {
    if (initialized) return;
    await loadScenariosWithSearch(debouncedSearchValue);
  };

  const loadMoreScenarios = async () => {
    if (loading || currentPage >= totalPages) return;
    await loadScenariosWithSearch(debouncedSearchValue, true);
  };

  const hasMorePages = currentPage < totalPages;

  if (!avatar?.id) {
    console.warn('AvatarScenarioModal: Invalid avatar prop provided');
    return null;
  }

  useEffect(() => {
    if (fetcher.state === 'loading') {
      setIsOpen(false);
      setSelectedScenario(null);
      return;
    }

    if (fetcher.state === 'idle' && fetcher.data?.error) {
      return;
    }
  }, [fetcher.state, fetcher.data]);
  const existingChatsByScenario = new Map<string, Chat>();
  const avatarChats = chats?.filter((chat) => chat.avatar.id === avatar.id) ?? avatar.chats ?? [];

  avatarChats.forEach((chat) => {
    if (chat.scenario?.id) {
      existingChatsByScenario.set(chat.scenario.id, chat);
    }
  });

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
  };

  const handleReset = () => {
    setSelectedScenario(null);
    setReplaceExisting(false);
    setSearchValue('');
    setScenarios([]);
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
      loadScenariosWithSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue]);

  const handleCreateChat = async () => {
    if (selectedScenario) {
      const existingChat = existingChatsByScenario.get(selectedScenario);

      if (existingChat && !replaceExisting) {
        navigate(`/chats/${existingChat.id}`);
        setIsOpen(false);
        return;
      }

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

      const isScenarioAttached = avatar.scenarios?.some((s) => s.id === selectedScenario) ?? false;

      if (!isScenarioAttached) {
        try {
          const currentScenarioIds = avatar.scenarios?.map((s) => s.id) || [];
          const updatedScenarioIds = [...currentScenarioIds, selectedScenario];

          const avatarFormData = new FormData();
          avatarFormData.append('avatarId', avatar.id);
          avatarFormData.append('name', avatar.name);
          avatarFormData.append('shortDesc', avatar.shortDesc);
          avatarFormData.append('character', avatar.character);
          avatarFormData.append('ttsVoiceId', avatar.ttsVoiceId);
          avatarFormData.append('published', avatar.published.toString());
          avatarFormData.append('language', avatar.language);
          avatarFormData.append('gender', avatar.gender);
          updatedScenarioIds.forEach((id) => {
            avatarFormData.append('scenarioIds[]', id);
          });

          const updateResponse = await fetchWithAuth(`avatars/${avatar.id}`, {
            method: 'PATCH',
            body: avatarFormData,
          });

          if (!updateResponse.ok) {
            console.error('Failed to add scenario to avatar');
          }
        } catch (error) {
          console.error('Error adding scenario to avatar:', error);
        }
      }

      const formData = new FormData();
      formData.append('avatarId', avatar.id);
      formData.append('scenarioId', selectedScenario);

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
          loadInitialScenarios();
        } else {
          handleReset();
        }
      }}
    >
      <Modal.Trigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </Modal.Trigger>
      <Modal.Content className='max-w-2xl'>
        <Modal.Title>Choose Scenario</Modal.Title>
        <Modal.Description>Select a scenario to start chatting with "{avatar.name}".</Modal.Description>

        <Modal.Body className='py-6'>
          <ErrorsBox errors={fetcher.data?.error ? [fetcher.data.error] : undefined} />

          <div className='space-y-4'>
            {/* Avatar Info Header */}
            <div className='bg-neutral-05 p-4 rounded-xl'>
              <h3 className='font-semibold text-base-black mb-2'>Selected Avatar:</h3>
              <div className='flex items-center gap-3'>
                <img
                  src={getPicture(avatar, 'avatars', false)}
                  srcSet={getPicture(avatar, 'avatars', true)}
                  alt={avatar.name}
                  className='w-12 h-12 rounded-full object-cover'
                />
                <div>
                  <p className='font-semibold text-base-black'>{avatar.name}</p>
                  <p className='text-sm text-neutral-01'>{avatar.shortDesc}</p>
                </div>
              </div>

              {/* Checkbox for replacing existing chat */}
              {selectedScenario && existingChatsByScenario.has(selectedScenario) && (
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

                  {/* Warning message when replace is checked */}
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
              <h3 className='font-semibold text-base-black mb-3'>Select Scenario:</h3>
              {!avatar.scenarios || (avatar.scenarios?.length || 0) === 0 ? (
                <div className='p-8 text-center text-neutral-01'>
                  <Icons.loading className='w-6 h-6 animate-spin mx-auto mb-2' />
                  <p>Loading scenarios...</p>
                </div>
              ) : (
                <div className='space-y-6 max-h-[480px] overflow-y-auto'>
                  {/* Avatar's existing scenarios */}
                  {avatar.scenarios && (avatar.scenarios?.length || 0) > 0 && (
                    <div>
                      <h4 className='text-sm font-medium text-neutral-01 mb-3'>Added to this avatar</h4>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {(avatar.scenarios || []).map((scenario) => {
                          const existingChat = existingChatsByScenario.get(scenario.id);
                          const isSelected = selectedScenario === scenario.id;

                          return (
                            <button
                              key={scenario.id}
                              onClick={() => handleScenarioSelect(scenario.id)}
                              className={cn(
                                'flex flex-col gap-2 p-3 rounded-xl border transition-all text-left min-h-[122px]',
                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-neutral-04 hover:border-neutral-03 hover:bg-neutral-05'
                              )}
                            >
                              <div className='flex items-center justify-between'>
                                <h5 className='font-semibold text-base-black'>{scenario.name}</h5>
                                <div className='flex gap-1'>
                                  {avatar.scenarios?.[0]?.id === scenario.id && (
                                    <span className='text-xs bg-base-black text-white px-2 py-1 rounded-full'>Default</span>
                                  )}
                                  {scenario.recommended && (
                                    <span className='text-xs bg-specials-success text-white px-2 py-1 rounded-full'>Recommended</span>
                                  )}
                                </div>
                              </div>

                              {scenario.introduction && <p className='text-sm text-neutral-01 line-clamp-2'>{scenario.introduction}</p>}

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

                  {/* Other available scenarios */}
                  {(scenarios.length > 0 || searchValue) && (
                    <div>
                      <h4 className='text-sm font-medium text-neutral-01 mb-3'>Other available scenarios</h4>

                      {/* Search input */}
                      <div className='mb-4'>
                        <Input.Root>
                          <Input.Input
                            type='text'
                            placeholder='Search scenarios...'
                            className='py-2 pl-10 text-sm'
                            value={searchValue}
                            onChange={handleSearchChange}
                            autoComplete='off'
                          />
                          <Input.Icon as={Icons.search} className='[&_svg]:size-4 peer-focus:bg-transparent!' />
                        </Input.Root>
                      </div>
                      {scenarios.length > 0 ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                          {scenarios.map((scenario) => {
                            const isSelected = selectedScenario === scenario.id;
                            const isAttached = avatar.scenarios?.some((s) => s.id === scenario.id);

                            return (
                              <button
                                key={scenario.id}
                                onClick={() => handleScenarioSelect(scenario.id)}
                                className={cn(
                                  'flex flex-col gap-2 p-3 rounded-xl border transition-all text-left min-h-[122px]',
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-neutral-04 hover:border-neutral-03 hover:bg-neutral-05'
                                )}
                              >
                                <div className='flex items-center justify-between'>
                                  <h5 className='font-semibold text-base-black'>{scenario.name}</h5>
                                  <div className='flex items-center gap-2'>
                                    {scenario.userId === me.id && (
                                      <span className='text-xs bg-neutral-04 text-neutral-01 px-2 py-1 rounded-full'>👤</span>
                                    )}
                                    {scenario.recommended && (
                                      <span className='text-xs bg-specials-success text-white px-2 py-1 rounded-full'>Recommended</span>
                                    )}
                                  </div>
                                </div>

                                {scenario.introduction && <p className='text-sm text-neutral-01 line-clamp-2'>{scenario.introduction}</p>}

                                <div className='flex items-center gap-2 text-xs'>
                                  {(() => {
                                    const existingChat = existingChatsByScenario.get(scenario.id);

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
                                          <span className='text-neutral-01'>Already added to avatar</span>
                                        </>
                                      );
                                    } else {
                                      return (
                                        <>
                                          <div className='size-2 rounded-full bg-blue-500' />
                                          <span className='text-neutral-01'>Will be added to avatar</span>
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
                          <p>No scenarios found matching "{searchValue}"</p>
                          <p className='text-sm mt-1'>Try adjusting your search terms</p>
                        </div>
                      )}

                      {/* Load More Button */}
                      {hasMorePages && scenarios.length > 0 && (
                        <div className='mt-4 text-center'>
                          <Button.Root onClick={loadMoreScenarios} disabled={loading} variant='secondary' className='w-full'>
                            {loading ? (
                              <>
                                <Icons.loading className='w-4 h-4 animate-spin mr-2' />
                                Loading more scenarios...
                              </>
                            ) : (
                              'Load More Scenarios'
                            )}
                          </Button.Root>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show message if no scenarios at all */}
                  {(!avatar.scenarios || (avatar.scenarios?.length || 0) === 0) && scenarios.length === 0 && !loading && (
                    <div className='p-8 text-center text-neutral-01'>
                      <p>No scenarios available.</p>
                      <p className='text-sm mt-2'>Create a scenario first to start chatting.</p>
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

          {selectedScenario ? (
            <Button.Root onClick={handleCreateChat} disabled={fetcher.state !== 'idle'} className='w-full'>
              {fetcher.state === 'submitting' ? (
                <>
                  <Icons.loading className='w-4 h-4 animate-spin' />
                  {existingChatsByScenario.has(selectedScenario) && replaceExisting
                    ? 'Replacing Chat...'
                    : existingChatsByScenario.has(selectedScenario) && !replaceExisting
                      ? 'Opening Chat...'
                      : 'Creating Chat...'}
                </>
              ) : (
                (() => {
                  const isScenarioAttached = avatar.scenarios?.some((s) => s.id === selectedScenario) ?? false;

                  if (existingChatsByScenario.has(selectedScenario) && !replaceExisting) {
                    return 'Continue Chat';
                  } else if (existingChatsByScenario.has(selectedScenario) && replaceExisting) {
                    return 'Replace Chat';
                  } else if (!isScenarioAttached) {
                    return 'Start Chat';
                  } else {
                    return 'Create Chat';
                  }
                })()
              )}
            </Button.Root>
          ) : (
            <Button.Root disabled className='w-full'>
              Select a Scenario
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default AvatarScenarioModal;
