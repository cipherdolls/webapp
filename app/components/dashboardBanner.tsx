import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import Jazzicon from 'react-jazzicon';
import { Icons } from './ui/icons';
import { useUser } from '~/hooks/queries/userQueries';
import UserEditModal from '~/components/UserEditModal';

interface BannerProps {
  description: string | ReactNode;
  showEditLink?: boolean;
}

export const DashboardBanner: FC<BannerProps> = ({ description, showEditLink = false }) => {
  const { data: user, isPending: userLoading } = useUser();
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);

  if (userLoading) {
    return (
      <div className='flex flex-col sm:gap-4 gap-2 sm:mt-0 mt-3' data-testid='dashboard-banner-loading'>
        <div className='relative'>
          <div className='rounded-[10px] h-[72px] bg-neutral-04 w-full max-w-96 animate-pulse'></div>
        </div>
        <div className='flex flex-col gap-1'>
          <p className='h-6 bg-neutral-04 rounded-[10px] w-[255px] '></p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const username = user.name;
  const isDefaultUsername = username?.toLowerCase() === 'adam';
  const seed = user.signerAddress ? parseInt(user.signerAddress.slice(2, 10), 16) : 0;

  return (
    <div className='flex flex-col sm:gap-4 gap-2 sm:mt-0 mt-3'>
      <div className='relative max-w-max'>
        <div className='flex items-center gap-3'>
          {user.signerAddress && <Jazzicon diameter={60} seed={seed} />}
          <h1 className='sm:text-heading-h1 text-heading-h2 text-base-black break-all'>
            Hey, {username}
            {isDefaultUsername && (
              <span className='text-xs max-w-72 block text-neutral-01 mt-1 break-normal sm:max-w-full'>
                This is a default username. If it's not your real name, you can change it below.
              </span>
            )}
          </h1>
        </div>
        {showEditLink && (
          <button onClick={() => setIsUserEditModalOpen(true)} className='absolute -top-2 -right-8 hover:opacity-50 transition-opacity'>
            <Icons.pen />
          </button>
        )}
      </div>
      <div className='flex flex-col gap-1'>
        <p className='sm:text-neutral-01 text-body-lg text-base-black'>{description}</p>
      </div>

      <UserEditModal me={user} open={isUserEditModalOpen} onOpenChange={setIsUserEditModalOpen} />
    </div>
  );
};

export default DashboardBanner;
