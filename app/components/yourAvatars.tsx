import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Icons } from '~/components/ui/icons';
import type { Chat } from '~/types';
import * as Button from '~/components/ui/button/button';
import { getPicture } from '~/utils/getPicture';
import AvatarScenarioModal from './AvatarScenarioModal';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import CardWithBadge from './DashboardCard';
import { ROUTES } from '~/constants';
import { cn } from '~/utils/cn';

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

  const avatars = myAvatars?.data || [];

  const [showAll, setShowAll] = useState(false);
  const hasAvatars = avatars.length > 0;

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  if (avatarsLoading) {
    return <YourAvatarsSkeleton />;
  }

  return (
    <div className='flex flex-col gap-5'>
      <h3 className='text-heading-h3 text-base-black'>Your Avatars</h3>
      <div className={cn('bg-gradient-1 rounded-xl p-2 pt-2 flex flex-col', hasAvatars && '!pt-0')}>
        {hasAvatars ? (
          <>
            <div className='grid grid-cols-2 divide-x py-4 divide-neutral-04'>
              <Link to={ROUTES.avatars} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.search className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Find Avatar
                  </span>
                </div>
              </Link>
              <Link to={`${ROUTES.avatars}/new`} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.pen className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Create Avatar
                  </span>
                </div>
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              {avatars.map((avatar, index) => (
                <div className={`${!showAll && index >= 4 ? 'hidden' : 'transition-all duration-500 ease-out'}`} key={index}>
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
            </div>
          </>
        ) : (
          <div className='bg-gradient-1 rounded-xl py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6 col-span-2'>
            <h1 className='text-heading-h2'>👤</h1>
            <div className='flex flex-col items-center sm:gap-2 gap-1'>
              <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Avatars Yet</h4>
              <Link
                to={ROUTES.avatars}
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
