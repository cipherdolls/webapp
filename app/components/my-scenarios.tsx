import React, { useState } from 'react';
import type { Scenario } from '~/types';
import * as Button from '~/components/ui/button/button';
import { Icons } from './ui/icons';
import ScenarioCard from './ScenarioCard';
import { Link } from 'react-router';
import { ROUTES } from '~/constants';

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
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-5 w-full'>
        {sortedScenarios.length === 0 ? (
          <div className='bg-gradient-1 rounded-xl py-6 sm:py-4 lg:py-8 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6 col-span-2'>
            <h1 className='text-heading-h2'>📚</h1>
            <div className='flex flex-col items-center sm:gap-2 gap-1'>
              <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Scenarios Yet</h4>
              <Link
                to={`${ROUTES.scenarios}/new`}
                className='text-body-md text-neutral-01 sm:text-center text-left underline decoration-neutral-01 underline-offset-2 hover:text-neutral-02 hover:decoration-neutral-02 transition-colors'
              >
                Click here to create one
              </Link>
            </div>
          </div>
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
