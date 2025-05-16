import React, { useState } from 'react';
import type { Scenario } from '~/types';
import * as Button from '~/components/ui/button/button';
import { Icons } from './ui/icons';
import { Link } from 'react-router';

const PublicScenarios = ({ scenarios }: { scenarios: Scenario[] }) => {
  const [showAll, setShowAll] = useState(false);

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  const displayedScenarios = showAll ? scenarios : scenarios.slice(0, 4);

  return (
    <div className='mt-6 flex flex-col gap-5 pb-5'>
      <h3 className='text-heading-h3 text-base-black'>Public Scenarios</h3>
      <div className='grid grid-cols-2 gap-5 w-full'>
        {displayedScenarios.map((scenario, index) => (
          <Link to={`/scenarios/${scenario.id}`} className='flex flex-col bg-gradient-1 rounded-xl overflow-hidden' key={index}>
            <div className='bg-white flex gap-2 p-5 justify-between '>
              <div className='flex flex-col gap-3'>
                <h6 className='text-body-md font-semibold text-base-black'>{scenario.name}</h6>
                <div className='flex items-center gap-2'>
                  <p className='text-body-sm text-neutral-02'>Mythomax L2 13B Nitro</p>
                  <span className='text-specials-success text-body-sm'>New</span>
                </div>
                <p className='text-base-black text-body-sm line-clamp-2'>{scenario.systemMessage}</p>
              </div>
              <Button.Root className='h-10 px-4'>Add</Button.Root>
            </div>
            <div className='flex items-center justify-between p-5'>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-3'>
                  <p className='w-[120px] text-body-sm text-neutral-01'>Frequency Penalty</p>
                  <span className='text-body-sm text-base-black'>{scenario.frequencyPenalty}</span>
                </div>
                <div className='flex items-center gap-3'>
                  <p className='w-[120px] text-body-sm text-neutral-01'>Presence Penalty</p>
                  <span className='text-body-sm text-base-black'>{scenario.presencePenalty}</span>
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-3'>
                  <p className='w-[120px] text-body-sm text-neutral-01'>Temperature</p>
                  <span className='text-body-sm text-base-black'>{scenario.temperature}</span>
                </div>
                <div className='flex items-center gap-3'>
                  <p className='w-[120px] text-body-sm text-neutral-01'>TopP</p>
                  <span className='text-body-sm text-base-black'>{scenario.topP}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {scenarios.length > 4 && (
        <div className='mx-auto'>
          <Button.Root variant='secondary' className='px-4 h-10 gap-2' onClick={handleShowAll}>
            {showAll ? 'Collapse' : 'Show all'}
            <Button.Icon as={Icons.chevronDown} className={`size-6 ${showAll ? 'rotate-180' : ''}`} />
          </Button.Root>
        </div>
      )}
    </div>
  );
};

export default PublicScenarios;
