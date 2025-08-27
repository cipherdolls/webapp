import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { Icons } from './ui/icons';
import { useUser } from '~/hooks/queries/userQueries';
import UserEditModal from '~/components/UserEditModal';

type BannerVariant = 'welcome' | 'danger' | 'warning';

interface BannerProps {
  variant: BannerVariant;
  description: string | ReactNode;
  showEditLink?: boolean;
}

const BANNER_CONFIGS = {
  welcome: (username?: string) => ({
    title: `👋 Hey, ${username}`,
  }),
  danger: () => ({
    title: '⛔ We are in danger',
  }),
  warning: () => ({
    title: '⚠️ Wait a minute',
  }),
} as const;

export const DashboardBanner: FC<BannerProps> = ({ variant, description, showEditLink = false }) => {
  const { data: user, isPending: userLoading } = useUser();
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);

  if (userLoading) {
    return (
      <div className='flex flex-col sm:gap-4 gap-2 sm:mt-0 mt-3'>
        <div className='relative max-w-max'>
          <div className='rounded-[10px] h-[72px] bg-gradient-1 w-48 animate-pulse'></div>
        </div>
        <div className='flex flex-col gap-1'>
          <p className='sm:text-neutral-01 text-body-lg text-base-black'>{description}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const username = user.name;
  const config = BANNER_CONFIGS[variant](username);
  const isDefaultUsername = username?.toLowerCase() === 'adam';

  return (
    <div className='flex flex-col sm:gap-4 gap-2 sm:mt-0 mt-3'>
      <div className='relative max-w-max'>
        <h1 className='sm:text-heading-h1 text-heading-h2 text-base-black break-all'>
          {config.title}
          {isDefaultUsername && (
            <span className='text-xs max-w-72 block text-neutral-01 mt-1 break-normal sm:max-w-full'>
              This is a default username. If it's not your real name, you can change it below.
            </span>
          )}
        </h1>
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
