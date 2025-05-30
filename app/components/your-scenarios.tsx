import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Icons } from '~/components/ui/icons';
import type { Scenario } from '~/types';
import { InformationBadge } from './ui/InformationBadge';
import { cn } from '~/utils/cn';
import * as Button from '~/components/ui/button/button';

const YourScenarios = ({ scenarios }: { scenarios: Scenario[] }) => {
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
      <div className='bg-gradient-1 p-2 pt-0 rounded-xl flex flex-col'>
        {hasScenarios ? (
          <>
            <div className='grid grid-cols-2 divide-x py-4 divide-neutral-04'>
              <Link to={'/community/scenarios'} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.search className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Find Scenario
                  </span>
                </div>
              </Link>
              <Link to={'/community/scenarios/new'} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.pen className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Create Scenario
                  </span>
                </div>
              </Link>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {sortedScenarios.map((scenario, index) => (
                <div className={`${!showAll && index >= 4 ? 'hidden' : 'transition-all duration-500 ease-out'}`} key={index}>
                  <Link
                    to={`/scenarios/${scenario.id}`}
                    className={cn(
                      'bg-white rounded-xl p-5 flex flex-col gap-3 cursor-pointer hover:bg-white/80 hover:drop-shadow-md transition-all group h-full',
                      sortedScenarios.length === 1 && 'col-span-2'
                    )}
                  >
                    <div className='flex items-center gap-2'>
                      <span className='text-body-md text-base-black font-semibold break-all line-clamp-1'>{scenario.name}</span>
                      <InformationBadge
                        className='size-4 text-neutral-02'
                        popoverClassName='!w-full'
                        tooltipText={
                          <div className='flex flex-col gap-1 text-body-sm text-base-black'>
                            <span>Frequency Penalty: {scenario.frequencyPenalty}</span>
                            <span>Presence Penalty: {scenario.presencePenalty}</span>
                            <span>Temperature: {scenario.temperature}</span>
                            <span>Top P: {scenario.topP}</span>
                          </div>
                        }
                      />
                    </div>
                    <p className='text-neutral-02 text-body-sm'>{scenario.chatModel.providerModelName}</p>
                    <p className='text-base-black line-clamp-2 text-body-sm break-all'>{scenario.systemMessage}</p>
                  </Link>
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
                to='/community/scenarios/new'
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
