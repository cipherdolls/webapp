import React, { useState } from 'react';
import type { Scenario } from '~/types';
import * as Button from '~/components/ui/button/button';
import { Icons } from './ui/icons';
import ScenarioCard from './ScenarioCard';

const MyScenarios = ({ scenarios }: { scenarios: Scenario[] }) => {
  const [showAll, setShowAll] = useState(false);

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  const sortedScenarios = [...scenarios].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className='mt-6 flex flex-col gap-5'>
      <h3 className='text-heading-h3 text-base-black'>My Scenarios</h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 w-full'>
        {sortedScenarios.length === 0 ? (
          <p className='text-body-md text-neutral-01 text-center md:col-span-2 col-span-1'>No scenarios found.</p>
        ) : (
          sortedScenarios.map((scenario, index) => (
            <ScenarioCard
              key={index}
              scenario={scenario}
              index={index}
              showAll={showAll}
              totalScenarios={scenarios.length}
              isPublic={false}
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

export default MyScenarios;
