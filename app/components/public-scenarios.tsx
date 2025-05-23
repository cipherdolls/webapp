import React, { useState } from 'react';
import type { Avatar, Scenario } from '~/types';
import * as Button from '~/components/ui/button/button';
import { Icons } from './ui/icons';
import { Link } from 'react-router';
import SelectAvatarModal from './SelectAvatarModal';
import { cn } from '~/utils/cn';

interface PublicScenariosProps {
  scenarios: Scenario[];
  avatars: Avatar[];
}

const PublicScenarios = ({ scenarios, avatars }: PublicScenariosProps) => {
  const [showAll, setShowAll] = useState(false);

  const handleShowAll = () => {
    setShowAll(!showAll);
  };


  return (
    <div className='mt-6 flex flex-col gap-5 pb-5'>
      <h3 className='text-heading-h3 text-base-black'>Public Scenarios</h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 w-full'>
        {scenarios.map((scenario, index) => (
          <div
            className={`${
              !showAll && index >= (scenarios.length > 6 ? 6 : 4)
                ? 'hidden'
                : scenarios.length > 6 && !showAll && index >= 4
                  ? 'max-h-28 overflow-hidden relative rounded-b-xl transition-all duration-300 ease-in-out'
                  : 'transition-all duration-500 ease-out'
            }`}
            key={index}
          >
            <div className='flex flex-col bg-gradient-1 rounded-xl overflow-hidden'>
              <div
                className={cn(
                  'flex sm:gap-2 gap-5 p-5 justify-between transition-colors duration-200 ease-in-out',
                  scenarios.length > 6 && !showAll && index >= 4 ? 'bg-transparent' : 'bg-white'
                )}
              >
                <Link to={`/scenarios/${scenario.id}`} className='flex flex-col gap-3 flex-1'>
                  <h6 className='text-body-md font-semibold text-base-black'>{scenario.name}</h6>
                  <div className='flex items-center gap-2'>
                    <p className='text-body-sm text-neutral-02'>{scenario.chatModel.providerModelName}</p>
                    <span className='text-specials-success text-body-sm'>New</span>
                  </div>
                  <p className='text-base-black text-body-sm line-clamp-2 min-h-8'>{scenario.systemMessage}</p>
                </Link>
                <SelectAvatarModal avatars={avatars} scenario={scenario} />
              </div>
              <Link to={`/scenarios/${scenario.id}`} className='grid lg:grid-cols-2 sm:grid-cols-1 grid-cols-2 gap-y-2 gap-x-5 p-5'>
                <div className='flex items-center gap-3'>
                  <p className='w-[120px] text-body-sm text-neutral-01 shrink-0'>Frequency Penalty</p>
                  <span className='text-body-sm text-base-black'>{scenario.frequencyPenalty}</span>
                </div>
                <div className='flex items-center gap-3 lg:justify-end sm:justify-start justify-end'>
                  <p className='w-[120px] text-body-sm text-neutral-01 shrink-0'>Presence Penalty</p>
                  <span className='text-body-sm text-base-black min-w-5'>{scenario.presencePenalty}</span>
                </div>
                <div className='flex items-center gap-3'>
                  <p className='w-[120px] text-body-sm text-neutral-01'>Temperature</p>
                  <span className='text-body-sm text-base-black'>{scenario.temperature}</span>
                </div>
                <div className='flex items-center gap-3 lg:justify-end sm:justify-start justify-end'>
                  <p className='w-[120px] text-body-sm text-neutral-01'>TopP</p>
                  <span className='text-body-sm text-base-black min-w-5'>{scenario.topP}</span>
                </div>
              </Link>
            </div>
            {scenarios.length > 6 && !showAll && index >= 4 && (
              <div className='absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 via-black/5 to-transparent pointer-events-none transition-opacity duration-200 ease-in-out'></div>
            )}
          </div>
        ))}
      </div>
      {scenarios.length > 4 && (
        <div className='mx-auto'>
          <Button.Root variant='secondary' className='px-4 h-10 gap-2' onClick={handleShowAll}>
            {showAll ? 'Collapse' : 'Show all'}
            <Button.Icon as={Icons.chevronDown} className={`size-6 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
          </Button.Root>
        </div>
      )}
    </div>
  );
};

export default PublicScenarios;
