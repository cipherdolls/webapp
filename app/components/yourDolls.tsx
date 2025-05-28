import { Card } from '~/components/card';
import HowToAddDollModal from '~/components/howToAddDollModal';
import DollCard from './dollCard';
import { cn } from '~/utils/cn';
import type { Doll } from '~/types';
import { Icons } from './ui/icons';
import { InformationBadge } from './ui/InformationBadge';

const YourDolls = ({ dolls }: { dolls: Doll[] }) => {
  return (
    <Card.Root className='sm:pl-4 sm:max-w-[352px]'>
      <div className='flex items-center justify-between'>
        <Card.Label>Your Dolls</Card.Label>
        <InformationBadge className='size-6' side='top' tooltipText='Your personal dolls' popoverClassName='ml-auto' />
      </div>
      <Card.Main className={cn(dolls.length > 0 && 'bg-none', 'max-h-max flex-none')}>
        <Card.Content className={cn(dolls.length === 0 && 'border-t-0')}>
          {dolls.length === 0 ? (
            <div className='sm:py-14'>
              <div className='py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6'>
                <h1 className='sm:text-heading-h1 text-heading-h2'>🤷‍♀️</h1>
                <div className='flex flex-col sm:gap-2 gap-1'>
                  <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Dolls Yet</h4>
                  <HowToAddDollModal />
                </div>
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-3'>
              {dolls.map((doll) => (
                <DollCard key={doll.id} doll={doll} />
              ))}
            </div>
          )}
        </Card.Content>
      </Card.Main>
    </Card.Root>
  );
};

export default YourDolls;
