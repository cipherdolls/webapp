import React, { useState } from 'react';
import type { Avatar, Scenario } from '~/types';
import * as Button from '~/components/ui/button/button';
import { Icons } from './ui/icons';
import ScenarioCard from './ScenarioCard';

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
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-5 w-full'>
        {scenarios.length === 0 ? (
          <p className='text-body-md text-neutral-01 text-center md:col-span-2 col-span-1'>No published scenarions found.</p>
        ) : (
          scenarios.map((scenario, index) => (
            <ScenarioCard
              key={index}
              scenario={scenario}
              index={index}
              showAll={showAll}
              totalScenarios={scenarios.length}
              isPublic={true}
              avatars={avatars}
            />
          ))
        )}
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
