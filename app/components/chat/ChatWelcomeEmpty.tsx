import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useNavigate } from 'react-router';
import type { Avatar, Scenario, User } from '~/types';
import { cn } from '~/utils/cn';
import { ROUTES } from '~/constants';
import AvatarPicture from '~/components/AvatarPicture';
import CreateTokenAllowanceModal from '~/components/CreateTokenAllowanceModal';
import { useScenarios } from '~/hooks/queries/scenarioQueries';
import { useCreateChat } from '~/hooks/queries/chatMutations';
import { useUser } from '~/hooks/queries/userQueries';
import { useUserEvents } from '~/hooks/useUserEvents';
import { useQueryClient } from '@tanstack/react-query';
import { getPicture } from '~/utils/getPicture';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { useAuthStore } from '~/store/useAuthStore';
import ChatSelectionWizard from '../ChatSelectionWizard';
import FreeToUseBadge from '~/components/FreeToUseBadge';
import LoginButton from '../website/LoginButton';

interface ChatWelcomeEmptyProps {
  avatars: Avatar[];
  user: User;
}

const AvatarSkeleton = () => (
  <div className='flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-neutral-04 animate-pulse'>
    <div className='w-20 h-20 rounded-full bg-neutral-04' />
    <div className='space-y-2 text-center'>
      <div className='h-4 bg-neutral-04 rounded w-20' />
      <div className='h-3 bg-neutral-04 rounded w-16' />
    </div>
  </div>
);

const ScenarioSkeleton = () => (
  <div className='flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-neutral-04 animate-pulse'>
    <div className='w-20 h-20 rounded-full bg-neutral-04' />
    <div className='space-y-2 text-center'>
      <div className='h-4 bg-neutral-04 rounded w-20' />
      <div className='h-3 bg-neutral-04 rounded w-24' />
    </div>
  </div>
);

const ChatWelcomeEmpty: React.FC<ChatWelcomeEmptyProps> = ({ avatars, user: userProp }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: currentUser } = useUser();
  const user = currentUser || userProp;
  const { isUsingBurnerWallet } = useAuthStore();
  const { mutate: createChat, isPending: isCreatingChat } = useCreateChat();

  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  // Listen for MQTT events to refresh user data when token permit is created
  useUserEvents(user.id, {
    onProcessEvent: (processEvent) => {
      if ((processEvent.resourceName === 'TokenPermit' || processEvent.resourceName === 'User') && processEvent.jobStatus === 'completed') {
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
  });

  const isLoadingAvatars = !avatars || avatars.length === 0;

  const randomAvatars = useMemo(() => {
    return avatars.sort(() => Math.random() - 0.5).slice(0, 3);
  }, [avatars]);

  const avatarScenarios = selectedAvatar?.scenarios || [];
  const shouldFetchPublishedScenarios = selectedAvatar && avatarScenarios.length < 3;

  const { data: publishedScenariosData } = useScenarios(
    shouldFetchPublishedScenarios
      ? {
          published: 'true',
          limit: '3',
        }
      : undefined
  );

  const displayScenarios = useMemo(() => {
    let baseScenarios: Scenario[] = [];

    if (avatarScenarios.length >= 3) {
      baseScenarios = avatarScenarios.slice(0, 3);
    } else if (shouldFetchPublishedScenarios && publishedScenariosData?.data) {
      baseScenarios = publishedScenariosData.data.slice(0, 3);
    }

    if (selectedScenario && baseScenarios.length > 0) {
      const isSelectedInDisplay = baseScenarios.some((scenario) => scenario.id === selectedScenario.id);
      if (!isSelectedInDisplay) {
        baseScenarios = [selectedScenario, ...baseScenarios.slice(1)];
      }
    }

    return baseScenarios;
  }, [avatarScenarios, shouldFetchPublishedScenarios, publishedScenariosData, selectedScenario]);

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setSelectedScenario(null);
  };

  const handleScenarioSelect = (scenario: Scenario | null) => {
    setSelectedScenario(scenario);
  };

  const handleStartChat = () => {
    if (!selectedAvatar || !selectedScenario) return;

    createChat(
      { avatarId: selectedAvatar.id, scenarioId: selectedScenario.id },
      {
        onSuccess: (newChat) => {
          navigate(`${ROUTES.chats}/${newChat.id}`);
        },
      }
    );
  };

  const showAllowancePrompt = user.tokenAllowance <= 0.001 && !isUsingBurnerWallet;
  const isGuestAndSelectedNotSponsored = isUsingBurnerWallet && !selectedScenario?.sponsorships?.length;

  const renderAllowanceCTA = () => (
    <>
      <div className='space-y-2'>
        <div className='flex justify-center items-center gap-2 mb-2'>
          <div className='text-3xl'>🎯</div>
        </div>
        <h3 className='text-heading-h4 font-semibold text-base-black'>Almost Done!</h3>
        <p className='text-body-md text-neutral-01 max-w-md mx-auto'>
          Create a token allowance to unlock free credits and start your conversation with {selectedAvatar?.name}
        </p>
      </div>
      <CreateTokenAllowanceModal>
        <Button.Root className='px-12 h-12 text-body-md font-semibold' size='lg'>
          <div className='flex items-center gap-2'>
            <Icons.add className='w-4 h-4' />
            Create Token Allowance
          </div>
        </Button.Root>
      </CreateTokenAllowanceModal>
    </>
  );

  const renderBaseCTA = () => (
    <>
      <div className='space-y-2'>
        <div className='flex justify-center items-center gap-2 mb-2'>
          <div className='text-3xl'>✅</div>
          <h3 className='text-heading-h4 font-semibold text-base-black'>All Set!</h3>
        </div>
        <p className='text-body-md text-neutral-01 max-w-md mx-auto'>
          {isUsingBurnerWallet ? 'You can now start chatting!' : 'Your token allowance is ready. You can now start chatting.'}
        </p>
      </div>

      <Button.Root onClick={handleStartChat} className='px-12 h-14 text-body-lg font-semibold' disabled={isCreatingChat} size='lg'>
        {isCreatingChat ? (
          <div className='flex items-center gap-2'>
            <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
            Starting Chat...
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            <Icons.chat className='w-5 h-5' />
            Start Chatting with {selectedAvatar?.name}
          </div>
        )}
      </Button.Root>
    </>
  );

  const renderGuestCTA = () => (
    <>
      <div className='space-y-2'>
        <div className='flex justify-center items-center gap-2 mb-2'>
          <div className='text-3xl'>🔓</div>
          <h3 className='text-heading-h4 font-semibold text-base-black'>Unlock this chat</h3>
        </div>
        <p className='text-body-md text-neutral-01 max-w-md mx-auto'>
          This chat is only available for registered users. Create your free account to start chatting with {selectedAvatar?.name}.
        </p>
      </div>
      <LoginButton size='lg'>
        <span>Create free account</span>
      </LoginButton>
    </>
  );

  const renderChatCTA = () => {
    if (showAllowancePrompt) return renderAllowanceCTA();
    if (isGuestAndSelectedNotSponsored) return renderGuestCTA();
    return renderBaseCTA();
  };

  return (
    <div className='flex-1 flex flex-col w-full mx-auto gap-10 py-10 px-6 overflow-y-auto'>
      <div className='text-center flex flex-col gap-3'>
        <div className='text-5xl mb-3'>💬</div>
        <h1 className='text-heading-h2 font-bold text-base-black'>Start Your First Chat</h1>
        <p className='text-body-lg text-neutral-01 max-w-2xl mx-auto'>
          Choose an avatar and conversation scenario to begin your AI-powered chat experience
        </p>
      </div>

      <div className='max-w-6xl mx-auto w-full'>
        <div className='flex lg:flex-row flex-col lg:items-center lg:gap-8 gap-6'>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-col gap-4'>
              <h2 className='text-heading-h3 font-semibold text-base-black'>Select an Avatar</h2>
              <p className='text-body-md text-neutral-01'>Choose your AI companion to chat with</p>
              <div>
                <Link to={ROUTES.avatars}>
                  <Button.Root variant='secondary' size='md' className='px-8'>
                    <Icons.chevronRight className='w-4 h-4 mr-2' />
                    View All Avatars
                  </Button.Root>
                </Link>
              </div>
            </div>
          </div>

          <div className='min-w-0 flex-[2]'>
            {isLoadingAvatars ? (
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                {Array.from({ length: 3 }, (_, index) => (
                  <AvatarSkeleton key={`avatar-skeleton-${index}`} />
                ))}
              </div>
            ) : randomAvatars.length === 0 ? (
              <div className='flex flex-col items-center gap-4 py-12'>
                <div className='text-5xl'>🤖</div>
                <div className='text-center space-y-2'>
                  <h3 className='text-heading-h4 font-semibold text-base-black'>No Avatars Available</h3>
                  <p className='text-body-md text-neutral-01'>Check back later or contact support</p>
                </div>
                <Link to={ROUTES.avatars}>
                  <Button.Root variant='primary' size='md'>
                    Browse All Avatars
                  </Button.Root>
                </Link>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                {randomAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={cn(
                      'group flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
                      selectedAvatar?.id === avatar.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                        : 'border-neutral-04 hover:border-neutral-02 hover:bg-neutral-05'
                    )}
                  >
                    <div className='relative'>
                      <AvatarPicture avatar={avatar} className='size-20' />
                      {selectedAvatar?.id === avatar.id && (
                        <div className='absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg'>
                          <Icons.check className='w-4 h-4 text-white' />
                        </div>
                      )}
                    </div>
                    <div className='text-center space-y-1'>
                      <h3 className='font-semibold text-body-lg text-base-black'>{avatar.name}</h3>
                      {avatar.shortDesc && <p className='text-sm text-neutral-01 line-clamp-2 max-w-32'>{avatar.shortDesc}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedAvatar && (
        <div className='max-w-6xl mx-auto w-full animate-in slide-in-from-bottom duration-500'>
          <div className='flex lg:flex-row flex-col lg:items-center lg:gap-8 gap-6'>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-col gap-4'>
                <h2 className='text-heading-h3 font-semibold text-base-black'>Choose a Scenario</h2>
                <p className='text-body-md text-neutral-01'>Pick a conversation style with {selectedAvatar.name}</p>
                <div>
                  <ChatSelectionWizard
                    mode='avatar-to-scenario'
                    avatar={selectedAvatar}
                    customAction={{
                      onClick: (_avatar: Avatar, scenario: Scenario | null) => scenario && handleScenarioSelect(scenario),
                      text: 'Select Scenario',
                    }}
                  >
                    <Button.Root variant='secondary' size='md' className='px-8'>
                      <Icons.chevronRight className='w-4 h-4 mr-2' />
                      Browse All Scenarios
                    </Button.Root>
                  </ChatSelectionWizard>
                </div>
              </div>
            </div>

            <div className='min-w-0 flex-[2]'>
              {displayScenarios.length === 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                  {Array.from({ length: 3 }, (_, index) => (
                    <ScenarioSkeleton key={`scenario-skeleton-${index}`} />
                  ))}
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                  {displayScenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => handleScenarioSelect(scenario)}
                      className={cn(
                        'relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
                        selectedScenario?.id === scenario.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                          : 'border-neutral-04 hover:border-neutral-02 hover:bg-neutral-05'
                      )}
                    >
                      {scenario.sponsorships && scenario.sponsorships.length > 0 && <FreeToUseBadge className='absolute top-1 left-1' />}
                      <div className='relative'>
                        <img
                          src={getPicture(scenario, 'scenarios', false)}
                          srcSet={getPicture(scenario, 'scenarios', true)}
                          alt={scenario.name}
                          className='w-20 h-20 rounded-full object-cover'
                        />
                        {selectedScenario?.id === scenario.id && (
                          <div className='absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg'>
                            <Icons.check className='w-4 h-4 text-white' />
                          </div>
                        )}
                      </div>

                      <div className='text-center space-y-1'>
                        <h4 className='font-semibold text-body-lg text-base-black'>{scenario.name}</h4>
                        {scenario.introduction && <p className='text-sm text-neutral-01 line-clamp-2 max-w-32'>{scenario.introduction}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedAvatar && selectedScenario && (
        <div className='max-w-4xl mx-auto animate-in slide-in-from-bottom duration-500'>
          <div className='text-center flex flex-col gap-4'>{renderChatCTA()}</div>
        </div>
      )}
    </div>
  );
};

export default ChatWelcomeEmpty;
