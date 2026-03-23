import { useState } from 'react';
import { Link } from 'react-router';
import { Icons } from '~/components/ui/icons';
import type { Chat } from '~/types';
import * as Button from '~/components/ui/button/button';
import ChatSelectionWizard from './ChatSelectionWizard';
import { cn } from '~/utils/cn';
import { useScenarios } from '~/hooks/queries/scenarioQueries';
import { useUser } from '~/hooks/queries/userQueries';
import DashboardCard from './DashboardCard';
import { ANIMATE_DURATION, ROUTES, TOKEN_BALANCE } from '~/constants';
import { motion } from 'motion/react';
import { useMediaQuery } from 'usehooks-ts';
import { useAuthStore } from '~/store/useAuthStore';

function YourScenariosSkeleton() {
  return (
    <div className='flex flex-col gap-5'>
      <div className='rounded-[10px] h-6 bg-neutral-04 w-full animate-pulse max-w-[137px]'></div>
      <div className='rounded-xl p-2 bg-neutral-05 w-full animate-pulse'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-12'>
          <div className='rounded-[10px] h-[184px] bg-neutral-04 w-full animate-pulse'></div>
          <div className='rounded-[10px] h-[184px] bg-neutral-04 w-full animate-pulse'></div>
          <div className='rounded-[10px] h-[184px] bg-neutral-04 w-full animate-pulse'></div>
          <div className='rounded-[10px] h-[184px] bg-neutral-04 w-full animate-pulse'></div>
        </div>
      </div>
    </div>
  );
}

const YourScenarios = ({ chats }: { chats?: Chat[] }) => {
  const { data: scenariosPaginated, isLoading: scenariosLoading } = useScenarios({ mine: 'true' });
  const { data: user } = useUser();
  const { isUsingBurnerWallet } = useAuthStore();
  const isLaptop = useMediaQuery('(min-width: 640px) and (max-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 640px)');

  const scenarios = scenariosPaginated?.data || [];
  const hasMinimumTokens = isUsingBurnerWallet || (user?.tokenSpendable || 0) >= TOKEN_BALANCE.MINIMUM_SPENDABLE;

  const [showAll, setShowAll] = useState(false);
  const hasScenarios = scenarios.length > 0;

  const defaultScenarioHeight = (isLaptop && 236) || (isMobile && 284) || 204;
  const initScenariosContainerHeight = scenarios.length <= 2 ? defaultScenarioHeight : defaultScenarioHeight * 2;

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  if (scenariosLoading) {
    return <YourScenariosSkeleton />;
  }

  return (
    <div className='flex flex-col gap-5'>
      <h3 className='text-heading-h3 text-base-black'>Your Scenarios</h3>

      <div className={cn('bg-gradient-1 rounded-xl p-2 pt-2 flex flex-col overflow-y-hidden', hasScenarios && '!pt-0')}>
        {hasScenarios ? (
          <>
            <div className='grid grid-cols-2 divide-x py-4 divide-neutral-04'>
              <Link to={ROUTES.scenarios} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.search className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Find Scenario
                  </span>
                </div>
              </Link>
              <Link to={ROUTES.accountScenariosNew} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.pen className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Create Scenario
                  </span>
                </div>
              </Link>
            </div>

            <motion.div
              initial={false}
              animate={{ height: !showAll ? initScenariosContainerHeight : 'auto' }}
              transition={ANIMATE_DURATION}
              className='grid grid-cols-1 sm:grid-cols-2 gap-x-2 -mt-2'
            >
              {scenarios.map((scenario, index) => {
                const isChatDisabled = !isUsingBurnerWallet && !scenario.free && !hasMinimumTokens;

                return (
                  <div className='pt-2' key={index}>
                    <DashboardCard item={scenario} type='scenarios' to={`${ROUTES.scenarios}/${scenario.id}`}>
                      <div className='flex flex-col gap-1 min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <h4 className='text-body-sm font-semibold text-base-black truncate'>{scenario.name}</h4>
                        </div>
                        {scenario.introduction && (
                          <p className='line-clamp-2 text-body-sm font-semibold text-neutral-01'>{scenario.introduction}</p>
                        )}
                      </div>
                      <div className='flex items-center gap-3'>
                        <ChatSelectionWizard mode='scenario-to-avatar' scenario={scenario}>
                          <Button.Root size='sm' className='px-5' disabled={isChatDisabled}>
                            Chat
                          </Button.Root>
                        </ChatSelectionWizard>
                      </div>
                    </DashboardCard>
                  </div>
                );
              })}
            </motion.div>
          </>
        ) : (
          <div className='bg-gradient-1 rounded-xl py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6 col-span-2'>
            <h1 className='text-heading-h2'>📚</h1>
            <div className='flex flex-col items-center sm:gap-2 gap-1'>
              <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Scenarios Yet</h4>
              <Link
                to={ROUTES.accountScenariosNew}
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
