import { useState } from 'react';
import { Link } from 'react-router';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { useDolls } from '~/hooks/queries/dollQueries';
import DashboardCard from './DashboardCard';
import { ANIMATE_DURATION, ROUTES } from '~/constants';
import { cn } from '~/utils/cn';
import { motion } from 'motion/react';
import { useMediaQuery } from 'usehooks-ts';

function YourDollsSkeleton() {
  return (
    <div className='flex flex-col gap-5'>
      <div className='rounded-[10px] h-6 bg-neutral-04 w-full animate-pulse max-w-[137px]'></div>
      <div className='rounded-xl p-2 bg-neutral-05 w-full animate-pulse'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-12'>
          <div className='rounded-[10px] h-[184px] bg-neutral-04 w-full animate-pulse'></div>
          <div className='rounded-[10px] h-[184px] bg-neutral-04 w-full animate-pulse'></div>
        </div>
      </div>
    </div>
  );
}

const YourDolls = () => {
  const { data: dolls = [], isLoading: dollsLoading } = useDolls();
  const isLaptop = useMediaQuery('(min-width: 640px) and (max-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 640px)');

  const [showAll, setShowAll] = useState(false);
  const hasDolls = dolls.length > 0;

  const defaultDollHeight = (isLaptop && 224) || (isMobile && 272) || 192;
  const initDollsContainerHeight = dolls.length <= 2 ? defaultDollHeight : defaultDollHeight * 2;

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  if (dollsLoading) {
    return <YourDollsSkeleton />;
  }

  return (
    <div className='flex flex-col gap-5'>
      <h3 className='text-heading-h3 text-base-black'>Your Dolls</h3>

      <div className={cn('bg-gradient-1 rounded-xl p-2 pt-2 flex flex-col overflow-y-hidden', hasDolls && '!pt-0')}>
        {hasDolls ? (
          <>
            <div className='flex items-center justify-center py-4'>
              <Link to={ROUTES.dollBodies} className='group'>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.search className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Browse Doll Bodies
                  </span>
                </div>
              </Link>
            </div>

            <motion.div
              initial={false}
              animate={{ height: !showAll ? initDollsContainerHeight : 'auto' }}
              transition={ANIMATE_DURATION}
              className='grid grid-cols-1 sm:grid-cols-2 gap-x-2 -mt-2'
            >
              {dolls.map((doll, index) => (
                <div className='pt-2' key={index}>
                  <DashboardCard item={{ ...doll, name: doll.name || 'Unnamed Doll' }} type='dolls' to={`${ROUTES.dolls}/${doll.id}`}>
                    <div className='flex flex-col gap-1 min-w-0 flex-1'>
                      <h4 className='text-body-sm font-semibold text-base-black truncate'>{doll.name || 'Unnamed Doll'}</h4>
                      <p className='truncate text-body-sm font-semibold text-neutral-01'>{doll.macAddress}</p>
                    </div>
                    <div className='flex items-center gap-2 flex-shrink-0'>
                      <span
                        className={cn('size-2 rounded-full', doll.online ? 'bg-green-500' : 'bg-neutral-03')}
                        title={doll.online ? 'Online' : 'Offline'}
                      />
                      <span className='text-body-sm text-neutral-01'>{doll.online ? 'Online' : 'Offline'}</span>
                    </div>
                  </DashboardCard>
                </div>
              ))}
            </motion.div>
          </>
        ) : (
          <div className='bg-gradient-1 rounded-xl py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6 col-span-2'>
            <h1 className='text-heading-h2'>🤖</h1>
            <div className='flex flex-col items-center sm:gap-2 gap-1'>
              <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Dolls Yet</h4>
              <Link
                to={ROUTES.dollBodies}
                className='text-body-md text-neutral-01 sm:text-center text-left underline decoration-neutral-01 underline-offset-2 hover:text-neutral-02 hover:decoration-neutral-02 transition-colors'
              >
                Browse doll bodies
              </Link>
            </div>
          </div>
        )}
      </div>

      {dolls.length > 4 && (
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

export default YourDolls;
