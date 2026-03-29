import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Scenario, User } from '~/types';
import { cn } from '~/utils/cn';
import { ROUTES } from '~/constants';
import { useScenarios } from '~/hooks/queries/scenarioQueries';
import { useCreateChat } from '~/hooks/queries/chatMutations';
import { getPicture } from '~/utils/getPicture';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';

interface ChatWelcomeEmptyProps {
  user: User;
}

const ScenarioSkeleton = () => (
  <div className='flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-neutral-04 animate-pulse'>
    <div className='w-24 h-24 rounded-full bg-neutral-04' />
    <div className='space-y-2 text-center'>
      <div className='h-5 bg-neutral-04 rounded w-28' />
      <div className='h-4 bg-neutral-04 rounded w-36' />
    </div>
  </div>
);

const ChatWelcomeEmpty: React.FC<ChatWelcomeEmptyProps> = () => {
  const navigate = useNavigate();
  const { mutate: createChat, isPending: isCreatingChat } = useCreateChat();

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const { data: freeScenariosData, isLoading: isLoadingScenarios } = useScenarios({
    published: 'true',
    free: 'true',
    limit: '8',
  });

  const freeScenarios = freeScenariosData?.data || [];

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
  };

  const handleStartChat = () => {
    if (!selectedScenario) return;

    const avatar = selectedScenario.avatars?.[0];
    if (!avatar) return;

    createChat(
      { avatarId: avatar.id, scenarioId: selectedScenario.id },
      {
        onSuccess: (newChat) => {
          navigate(`${ROUTES.chats}/${newChat.id}`);
        },
      }
    );
  };

  return (
    <div className='flex-1 flex flex-col w-full mx-auto gap-8 py-10 px-6 overflow-y-auto'>
      <div className='text-center flex flex-col gap-3'>
        <div className='text-5xl mb-2'>💬</div>
        <h1 className='text-heading-h2 font-bold text-base-black'>Start Your First Chat</h1>
        <p className='text-body-lg text-neutral-01 max-w-xl mx-auto'>Choose a scenario below to begin chatting</p>
      </div>

      <div className='max-w-4xl mx-auto w-full'>
        {isLoadingScenarios ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 3 }, (_, index) => (
              <ScenarioSkeleton key={`scenario-skeleton-${index}`} />
            ))}
          </div>
        ) : freeScenarios.length === 0 ? (
          <div className='flex flex-col items-center gap-4 py-12'>
            <div className='text-5xl'>🎭</div>
            <div className='text-center space-y-2'>
              <h3 className='text-heading-h4 font-semibold text-base-black'>No Scenarios Available</h3>
              <p className='text-body-md text-neutral-01'>Check back later for chat options</p>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {freeScenarios.map((scenario) => (
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
                <div className='relative'>
                  <img
                    src={getPicture(scenario, 'scenarios', false)}
                    srcSet={getPicture(scenario, 'scenarios', true)}
                    alt={scenario.name}
                    className='w-24 h-24 rounded-full object-cover'
                  />
                  {selectedScenario?.id === scenario.id && (
                    <div className='absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg'>
                      <Icons.check className='w-4 h-4 text-white' />
                    </div>
                  )}
                </div>

                <div className='text-center space-y-1'>
                  <h4 className='font-semibold text-body-lg text-base-black'>{scenario.name}</h4>
                  {scenario.introduction && <p className='text-sm text-neutral-01 line-clamp-2 max-w-40'>{scenario.introduction}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedScenario && (
        <div className='max-w-4xl mx-auto w-full animate-in slide-in-from-bottom duration-300'>
          <div className='flex flex-col items-center gap-4'>
            <Button.Root onClick={handleStartChat} className='px-12 h-14 text-body-lg font-semibold' disabled={isCreatingChat} size='lg'>
              {isCreatingChat ? (
                <div className='flex items-center gap-2'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Starting Chat...
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <Icons.chat className='w-5 h-5' />
                  Start Chat
                </div>
              )}
            </Button.Root>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWelcomeEmpty;
