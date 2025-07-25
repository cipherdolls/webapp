import { useFetcher } from 'react-router';
import type { Avatar, Chat } from '~/types';
import { cn } from '~/utils/cn';

interface ScenarioToggleProps {
  chat: Chat;
  avatar: Avatar;
  className?: string;
  wideVariant?: boolean;
}

const ScenarioToggle = ({ chat, avatar, className, wideVariant = false }: ScenarioToggleProps) => {
  const fetcher = useFetcher();

  const handleScenarioChange = (scenarioId: string) => {
    fetcher.submit(
      { scenarioId },
      {
        method: 'PATCH',
        action: `/chats/${chat.id}`,
      }
    );
  };

  return (
    <div
      className={cn(
        'grid grid-cols-2 p-1 gap-1 rounded-xl',
        {
          'sm:gap-0 sm:bg-neutral-04 md:flex min-w-[200px]': wideVariant,
        },
        className
      )}
    >
      {(avatar.scenarios?.length || 0) > 0 ? (
        avatar.scenarios?.map((scenario) => (
          <button
            key={scenario.id}
            type='button'
            onClick={() => handleScenarioChange(scenario.id)}
            className={cn(
              'flex items-center justify-center flex-1 px-4 h-[48px] text-body-sm font-semibold rounded-xl border-neutral-04 bg-clip-padding bg-neutral-04',
              wideVariant && 'sm:h-[40px] sm:w-[110px] sm:rounded-[10px] sm:bg-transparent sm:border-none md:w-auto md:min-w-[120px]',
              chat.scenario.id === scenario.id && '!bg-base-white shadow-regular pointer-events-none',
              (avatar.scenarios?.length || 0) === 1 && !wideVariant && 'col-span-2'
            )}
          >
            {scenario.name}
          </button>
        ))
      ) : (
        <p className='flex items-center justify-center text-body-md text-neutral-01 h-[48px] sm:h-[40px] px-5'>No scenarios available</p>
      )}
    </div>
  );
};

export default ScenarioToggle;
