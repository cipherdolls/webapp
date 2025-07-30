import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Icons } from '~/components/ui/icons';
import type { Chat, Scenario } from '~/types';
import * as Button from '~/components/ui/button/button';
import { getPicture } from '~/utils/getPicture';
import ScenarioAvatarModal from './ScenarioAvatarModal';
import { cn } from '~/utils/cn';

const YourScenarios = ({ scenarios, chats }: { scenarios: Scenario[]; chats?: Chat[] }) => {
  const [showAll, setShowAll] = useState(false);
  const hasScenarios = scenarios.length > 0;

  const sortedScenarios = useMemo(() => {
    return [...scenarios].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [scenarios]);

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <div className='flex flex-col gap-5'>
      <h3 className='text-heading-h3 text-base-black'>Your Scenarios</h3>
      <div className={cn('bg-gradient-1 rounded-xl p-2 pt-2 flex flex-col', hasScenarios && '!pt-0')}>
        {hasScenarios ? (
          <>
            <div className='grid grid-cols-2 divide-x py-4 divide-neutral-04'>
              <Link to={'/scenarios'} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.search className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Find Scenario
                  </span>
                </div>
              </Link>
              <Link to={'/scenarios/new'} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.pen className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Create Scenario
                  </span>
                </div>
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              {sortedScenarios.map((scenario, index) => (
                <div className={`${!showAll && index >= 4 ? 'hidden' : 'transition-all duration-500 ease-out'}`} key={index}>
                  <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden'>
                    <Link
                      to={`/scenarios/${scenario.id}`}
                      className='block h-[200px] sm:h-[152px] lg:h-[120px] rounded-xl bg-black relative'
                    >
                      <img
                        src={getPicture(scenario, 'scenarios', false)}
                        srcSet={getPicture(scenario, 'scenarios', true)}
                        alt={`${scenario.name} picture`}
                        className='object-cover size-full'
                      />

                      <div className='absolute top-2 left-2 z-10'>
                        <div className='flex items-center gap-1 bg-gradient-1 py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                          🌐
                          <span>By you</span>
                        </div>
                      </div>
                    </Link>

                    <div className='p-3 flex lg:items-center gap-5 justify-between flex-1'>
                      <div className='flex flex-col gap-1 min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <h4 className='text-body-sm font-semibold text-base-black truncate'>{scenario.name}</h4>
                        </div>
                        {scenario.introduction && (
                          <p className='line-clamp-2 text-body-sm font-semibold text-neutral-01'>{scenario.introduction}</p>
                        )}
                      </div>
                      <div className='flex items-center gap-3'>
                        <ScenarioAvatarModal scenario={scenario} chats={chats}>
                          <Button.Root size='sm' className='px-5'>
                            Chat
                          </Button.Root>
                        </ScenarioAvatarModal>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className='bg-gradient-1 rounded-xl py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6 col-span-2'>
            <h1 className='text-heading-h2'>📚</h1>
            <div className='flex flex-col items-center sm:gap-2 gap-1'>
              <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Scenarios Yet</h4>
              <Link
                to='/scenarios'
                className='text-body-md text-neutral-01 sm:text-center text-left underline decoration-neutral-01 underline-offset-2 hover:text-neutral-02 hover:decoration-neutral-02 transition-colors'
              >
                Add new scenario
              </Link>
            </div>
          </div>
        )}
      </div>
      {scenarios.length > 4 && (
        <div className='mx-auto -mt-2'>
          <Button.Root variant='secondary' className='px-4 h-10 gap-2' onClick={handleShowAll}>
            {showAll ? 'Collapse' : 'Show all'}
            <Button.Icon as={Icons.chevronDown} className={`size-6 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
          </Button.Root>
        </div>
      )}
    </div>
  );
};

export default YourScenarios;
