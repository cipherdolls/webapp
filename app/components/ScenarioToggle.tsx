import { useFetcher } from 'react-router';
import type { Avatar, Chat } from '~/types';
import { cn } from '~/utils/cn';

interface ScenarioToggleProps {
  chat: Chat;
  avatar: Avatar;
  className?: string;
}

const ScenarioToggle = ({ chat, avatar, className }: ScenarioToggleProps) => {
  const fetcher = useFetcher();

  const handleScenarioChange = (scenarioId: string) => {
    fetcher.submit(
      { scenarioId },
      {
        method: 'PATCH',
        action: `/chats/${chat.id}`
      }
    );
  };

  return (
    <div className={cn('grid grid-cols-2 md:flex gap-1 sm:gap-0 sm:bg-neutral-04 rounded-xl p-1 min-w-[200px]', className)}>
      {avatar.scenarios.length > 0 ? (
        avatar.scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type='button'
            onClick={() => handleScenarioChange(scenario.id)}
            className={cn(
              'flex items-center justify-center flex-1 px-4 h-[48px] text-body-sm font-semibold rounded-xl sm:rounded-[10px] border-4 border-neutral-04 bg-clip-padding bg-neutral-04',
              'sm:h-[40px] sm:w-[110px] sm:bg-transparent sm:border-none',
              'md:w-auto md:min-w-[120px]',
              chat.scenario.id === scenario.id && '!bg-base-white shadow-regular pointer-events-none'
            )}
          >
            {scenario.name}
          </button>
        ))
      ) : (
        <p className='flex items-center justify-center text-body-md text-neutral-01 h-[48px] px-5'>No scenarios available</p>
      )}
    </div>
  );
};

export default ScenarioToggle;
