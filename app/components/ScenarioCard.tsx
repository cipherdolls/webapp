import type { Avatar, Scenario } from '~/types';
import { Link } from 'react-router';
import { cn } from '~/utils/cn';
import SelectAvatarModal from './SelectAvatarModal';
import { getPicture } from '~/utils/getPicture';
import { InformationBadge } from './ui/InformationBadge';
import { ROUTES } from '~/constants';

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
    !showAll && index >= (totalScenarios > 9 ? 9 : 6)
      ? 'hidden'
      : totalScenarios > 9 && !showAll && index >= 6
        ? index === 8
          ? 'h-6 overflow-hidden relative transition-all duration-300 ease-in-out bg-gradient-to-b from-white to-transparent rounded-t-xl hidden sm:block'
          : 'h-6 overflow-hidden relative transition-all duration-300 ease-in-out bg-gradient-to-b from-white to-transparent rounded-t-xl'
        : 'transition-all duration-500 ease-out'
  }`;

  const myCardClassName = `${
    !showAll && index >= (totalScenarios > 6 ? 6 : 3)
      ? 'hidden'
      : totalScenarios > 6 && !showAll && index >= 3
        ? index === 5
          ? 'h-6 overflow-hidden relative transition-all duration-300 ease-in-out bg-gradient-to-b from-white to-transparent rounded-t-xl hidden sm:block'
          : 'h-6 overflow-hidden relative transition-all duration-300 ease-in-out bg-gradient-to-b from-white to-transparent rounded-t-xl'
        : 'transition-all duration-500 ease-out'
  }`;

  const publicHidden = totalScenarios > 9 && !showAll && index >= 6;
  const myHidden = totalScenarios > 6 && !showAll && index >= 3;

  return (
    <div className={cn('flex flex-col rounded-xl overflow-hidden relative', isPublic ? cardClassName : myCardClassName)}>
      <div className={cn('relative h-[152px] w-full', (isPublic ? publicHidden : myHidden) ? 'hidden' : '')}>
        <Link to={`${ROUTES.scenarios}/${scenario.id}`}>
          <img
            src={getPicture(scenario, 'avatars', false)}
            srcSet={getPicture(scenario, 'avatars', true)}
            alt={`${scenario.name} picture`}
            className='object-cover h-[152px] w-full'
          />
        </Link>
        <div className='absolute bottom-2.5 right-2.5'>{avatars && <SelectAvatarModal avatars={avatars} scenario={scenario} />}</div>
      </div>
      <Link to={`${ROUTES.scenarios}/${scenario.id}`}>
        <div className={cn(' flex-col gap-2 flex-1 p-5 bg-gradient-1', (isPublic ? publicHidden : myHidden) ? 'hidden' : 'flex')}>
          <div className='flex items-center gap-2'>
            <h6 className='text-body-md font-semibold text-base-black line-clamp-1 break-all'>{scenario.name}</h6>
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
          <p className='text-base-black text-body-sm line-clamp-2 min-h-8 break-all'>{scenario.systemMessage}</p>
        </div>
      </Link>

      {isNewScenario() && (
        <span
          className={cn(
            'text-specials-success text-body-sm shrink-0 whitespace-nowrap absolute top-2.5 right-2.5 bg-gradient-1 p-1.5 rounded-full hover:bg-white transition-colors cursor-pointer',
            (isPublic ? publicHidden : myHidden) ? 'hidden' : ''
          )}
        >
          New
        </span>
      )}
    </div>
  );
};

export default ScenarioCard;
