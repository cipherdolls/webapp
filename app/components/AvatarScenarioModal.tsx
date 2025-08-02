import { useNavigate, useRouteLoaderData } from 'react-router';
import * as Modal from '~/components/ui/new-modal';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import type { Avatar, Scenario, User } from '~/types';
import { useState, useCallback } from 'react';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import { Icons } from './ui/icons';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { useDebounceValue } from 'usehooks-ts';
import { useInfiniteScenarios } from '~/hooks/queries/scenarioQueries';
import { useCreateChat, useDeleteChat } from '~/hooks/queries/chatMutations';
import { useConfirm } from '~/providers/AlertDialogProvider';

interface AvatarScenarioModalProps {
  avatar: Avatar;
  children: React.ReactNode;
}

const AvatarScenarioModal: React.FC<AvatarScenarioModalProps> = ({ avatar, children }) => {
  const me = useRouteLoaderData('routes/_main') as User;
  const navigate = useNavigate();

  const { mutate: createChat, isPending: isPendingCreateChat, error: errorCreateChat } = useCreateChat();
  const { mutate: deleteChat, isPending: isDeletingChat, error: errorDeleteChat } = useDeleteChat();

  const confirm = useConfirm();

  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const {
    data: scenariosData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteScenarios({
    published: 'true',
    mine: 'true',
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounceValue(searchValue, 300);

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
  };

  const scenarios = scenariosData?.pages.flatMap((page) => page.data) || [];

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const isPending = isPendingCreateChat || isDeletingChat;


  //  TODO: Move this logic to the backend!!
  const handleCreateChat = async () => {
    const confirmResult = await confirm({
      icon: '🗑️',
      title: 'Delete Previous Chat?',
      body: 'If you create a new chat with this scenario, your previous chat will be permanently deleted and cannot be restored. Do you want to continue?',
      actionButton: 'Yes, Create New',
    });

    if (!confirmResult) return;

    if (selectedScenario) {
      const chatWithSameScenario = avatar.chats?.find((chat) => chat.scenarioId === selectedScenario);
      deleteChat(chatWithSameScenario.id, {
        onSuccess: () => {
          createChat(
            { avatarId: avatar.id, scenarioId: selectedScenario },
            {
              onSuccess: (newChat) => {
                setIsOpen(false);
                setSelectedScenario(null);
                navigate(`/chats/${newChat.id}`);
              },
            }
          );
        },
      });
    }
  };

  return (
    <Modal.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <Modal.Trigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </Modal.Trigger>
      <Modal.Content className='max-w-2xl'>
        <Modal.Title>Choose Scenario</Modal.Title>
        <Modal.Description>Select a scenario to start chatting with "{avatar.name}".</Modal.Description>

        <Modal.Body className='py-6'>
          <ErrorsBox errors={errorDeleteChat || errorCreateChat} />

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
                          // const existingChat = existingChatsByScenario.get(scenario.id);
                          const hasChat = avatar.chats?.some((chat) => chat.scenarioId === scenario.id);
                          const isSelected = selectedScenario === scenario.id;
                          return (
                            <ScenarioCard
                              scenario={scenario}
                              onSelect={() => handleScenarioSelect(scenario.id)}
                              isSelected={isSelected}
                              chatStatus={hasChat ? 'existing' : 'new'}
                            />
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
                            const hasChat = avatar.chats?.some((chat) => chat.scenarioId === scenario.id);
                            const isSelected = selectedScenario === scenario.id;
                            const isUserScenario = scenario.userId === me.id;

                            return (
                              <ScenarioCard
                                scenario={scenario}
                                onSelect={() => handleScenarioSelect(scenario.id)}
                                isSelected={isSelected}
                                chatStatus={hasChat ? 'existing' : 'new'}
                                isUserScenario={isUserScenario}
                              />
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
                      {hasNextPage && scenarios.length > 0 && (
                        <div className='mt-4 text-center'>
                          <Button.Root onClick={() => fetchNextPage()} disabled={isFetchingNextPage} variant='secondary' className='w-full'>
                            {isFetchingNextPage ? (
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
                  {(!avatar.scenarios || (avatar.scenarios?.length || 0) === 0) && scenarios.length === 0 && !isLoading && (
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

          <Button.Root onClick={handleCreateChat} disabled={!selectedScenario || isPending} className='w-full'>
            {isPending ? (
              <>
                <Icons.loading className='w-4 h-4 animate-spin' />
                Creating Chat...
              </>
            ) : (
              'Start Chat'
            )}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default AvatarScenarioModal;

interface ScenarioCardProps {
  scenario: Scenario;
  isUserScenario?: boolean;
  onSelect: () => void;
  isSelected: boolean;
  chatStatus: 'existing' | 'new';
}

const ScenarioCard = ({ scenario, isUserScenario, onSelect, isSelected, chatStatus }: ScenarioCardProps) => {
  return (
    <button
      key={scenario.id}
      onClick={onSelect}
      className={cn(
        'flex flex-col gap-2 p-3 rounded-xl border transition-all text-left min-h-[122px]',
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-neutral-04 hover:border-neutral-03 hover:bg-neutral-05'
      )}
    >
      <div className='flex items-center justify-between'>
        <h5 className='font-semibold text-base-black'>{scenario.name}</h5>
        <div className='flex gap-1'>
          {isUserScenario && <span className='text-xs bg-neutral-04 text-neutral-01 px-2 py-1 rounded-full'>👤</span>}
          {scenario.recommended && <span className='text-xs bg-specials-success text-white px-2 py-1 rounded-full'>Recommended</span>}
        </div>
      </div>

      {scenario.introduction && <p className='text-sm text-neutral-01 line-clamp-2'>{scenario.introduction}</p>}

      <div className='flex items-center gap-2 text-xs'>
        {chatStatus === 'existing' ? (
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
};
