import React from 'react';
import type { Avatar, Scenario } from '~/types';
import { Link } from 'react-router';
import { cn } from '~/utils/cn';
import SelectAvatarModal from './SelectAvatarModal';

interface ScenarioCardProps {
  scenario: Scenario;
  index: number;
  showAll: boolean;
  totalScenarios: number;
  isPublic?: boolean;
  avatars?: Avatar[];
}

const ScenarioCard = ({ scenario, index, showAll, totalScenarios, isPublic = false, avatars }: ScenarioCardProps) => {
  const isNewScenario = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return new Date(scenario.createdAt) > oneMonthAgo;
  };

  const cardClassName = `${
    !showAll && index >= (totalScenarios > 6 ? 6 : 4)
      ? 'hidden'
      : totalScenarios > 6 && !showAll && index >= 4
        ? index === 5
          ? 'h-6 overflow-hidden relative transition-all duration-300 ease-in-out bg-gradient-to-b from-white to-transparent rounded-t-xl hidden sm:block'
          : 'h-6 overflow-hidden relative transition-all duration-300 ease-in-out bg-gradient-to-b from-white to-transparent rounded-t-xl'
        : 'transition-all duration-500 ease-out'
  }`;

  const contentClassName = cn(
    'p-5 flex flex-col gap-3 transition-colors duration-200 ease-in-out',
    totalScenarios > 6 && !showAll && index >= 4 ? 'bg-transparent' : 'bg-white'
  );

  const publicContentClassName = cn(
    'flex sm:gap-2 gap-5  justify-between transition-colors duration-200 ease-in-out',
    totalScenarios > 6 && !showAll && index >= 4 ? 'bg-transparent px-5 py-8' : 'bg-white p-5'
  );

  if (isPublic) {
    return (
      <div className={cardClassName} key={index}>
        <div
          className={cn(
            'flex flex-col rounded-xl overflow-hidden',
            totalScenarios > 6 && !showAll && index >= 4 ? 'bg-transparent' : 'bg-gradient-1 '
          )}
        >
          <div className={publicContentClassName}>
            <Link to={`/scenarios/${scenario.id}`} className='flex flex-col gap-3 flex-1'>
              <h6 className='text-body-md font-semibold text-base-black line-clamp-1 break-all'>{scenario.name}</h6>
              <div className='flex items-center gap-2'>
                <p className='text-body-sm text-neutral-02'>{scenario.chatModel.providerModelName}</p>
                {isNewScenario() && <span className='text-specials-success text-body-sm'>New</span>}
              </div>
              <p className='text-base-black text-body-sm line-clamp-2 min-h-8 break-all'>{scenario.systemMessage}</p>
            </Link>
            {avatars && <SelectAvatarModal avatars={avatars} scenario={scenario} />}
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
      </div>
    );
  }

  return (
    <div className={cardClassName} key={index}>
      <Link
        to={`/scenarios/${scenario.id}`}
        className={cn(
          'flex flex-col rounded-xl overflow-hidden',
          totalScenarios > 6 && !showAll && index >= 4 ? 'bg-transparent' : 'bg-gradient-1 '
        )}
      >
        <div className={contentClassName}>
          <h6 className='text-body-md font-semibold text-base-black line-clamp-1 break-all'>{scenario.name}</h6>
          <div className='flex items-center gap-2'>
            <p className='text-body-sm text-neutral-02'>{scenario.chatModel.providerModelName}</p>
            {isNewScenario() && <span className='text-specials-success text-body-sm'>New</span>}
          </div>
          <p className='text-base-black text-body-sm line-clamp-2 min-h-8 break-all'>{scenario.systemMessage}</p>
        </div>
        <div className='grid lg:grid-cols-2 sm:grid-cols-1 grid-cols-2 gap-y-2 gap-x-5 p-5'>
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
        </div>
      </Link>
      {totalScenarios > 6 && !showAll && index >= 4 && (
        <div className='absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 via-black/5 to-transparent pointer-events-none transition-opacity duration-200 ease-in-out'></div>
      )}
    </div>
  );
};

export default ScenarioCard;
