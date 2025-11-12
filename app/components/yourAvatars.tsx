import { useState } from 'react';
import { Link } from 'react-router';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import AvatarScenarioModal from './AvatarScenarioModal';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { useUser } from '~/hooks/queries/userQueries';
import CardWithBadge from './DashboardCard';
import { ANIMATE_DURATION, ROUTES } from '~/constants';
import { cn } from '~/utils/cn';
import { motion } from 'motion/react';
import { useMediaQuery } from 'usehooks-ts';

function YourAvatarsSkeleton() {
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

const YourAvatars = () => {
  const { data: myAvatars, isLoading: avatarsLoading } = useAvatars({ mine: 'true' });
  const { data: user } = useUser();
  const isLaptop = useMediaQuery('(min-width: 640px) and (max-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 640px)');

  const avatars = myAvatars?.data || [];

  const [showAll, setShowAll] = useState(false);
  const hasAvatars = avatars.length > 0;

  const defaultAvatarHeight = (isLaptop && 224) || (isMobile && 272) || 192;
  const initAvatarsContainerHeight = avatars.length <= 2 ? defaultAvatarHeight : defaultAvatarHeight * 2;

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  if (avatarsLoading) {
    return <YourAvatarsSkeleton />;
  }

  return (
    <div className='flex flex-col gap-5'>
      <h3 className='text-heading-h3 text-base-black'>Your Avatars</h3>

      <div className={cn('bg-gradient-1 rounded-xl p-2 pt-2 flex flex-col overflow-y-hidden', hasAvatars && '!pt-0')}>
        {hasAvatars ? (
          <>
            <div className='grid grid-cols-2 divide-x py-4 overflow-y-hidden divide-neutral-04'>
              <Link to={ROUTES.avatars} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.search className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Find Avatar
                  </span>
                </div>
              </Link>
              <Link to={ROUTES.accountAvatarsNew} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.pen className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Create Avatar
                  </span>
                </div>
              </Link>
            </div>

            <motion.div
              initial={false}
              animate={{ height: !showAll ? initAvatarsContainerHeight : 'auto' }}
              transition={ANIMATE_DURATION}
              className='grid grid-cols-1 sm:grid-cols-2 gap-x-2 -mt-2'
            >
              {avatars.map((avatar, index) => (
                <div className='pt-2' key={index}>
                  <CardWithBadge item={avatar} type='avatars' to={`${ROUTES.avatars}/${avatar.id}`}>
                    <div className='flex flex-col gap-1 min-w-0 flex-1'>
                      <h4 className='text-body-sm font-semibold text-base-black truncate'>{avatar.name}</h4>
                      <p className='truncate text-body-sm font-semibold text-neutral-01'>{avatar.shortDesc}</p>
                    </div>
                    <div className='flex items-center gap-3 flex-shrink-0'>
                      <AvatarScenarioModal avatar={avatar}>
                        <Button.Root size='sm' className='px-5'>
                          Chat
                        </Button.Root>
                      </AvatarScenarioModal>
                    </div>
                  </CardWithBadge>
                </div>
              ))}
            </motion.div>
          </>
        ) : (
          <div className='bg-gradient-1 rounded-xl py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6 col-span-2'>
            <h1 className='text-heading-h2'>👤</h1>
            <div className='flex flex-col items-center sm:gap-2 gap-1'>
              <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Avatars Yet</h4>
              <Link
                to={ROUTES.accountAvatarsNew}
                className='text-body-md text-neutral-01 sm:text-center text-left underline decoration-neutral-01 underline-offset-2 hover:text-neutral-02 hover:decoration-neutral-02 transition-colors'
              >
                Add new avatar
              </Link>
            </div>
          </div>
        )}
      </div>

      {avatars.length > 4 && (
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

export default YourAvatars;
