import type { FC, ReactNode } from 'react';
import { Link } from 'react-router';

type BannerVariant = 'welcome' | 'danger' | 'warning';

interface BannerProps {
  variant: BannerVariant;
  username?: string;
  description: string | ReactNode;
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

export const DashboardBanner: FC<BannerProps> = ({ variant, username, description }) => {
  const config = BANNER_CONFIGS[variant](username);
  const isDefaultUsername = username?.toLowerCase() === 'adam';

  return (
    <div className='flex flex-col sm:gap-4 gap-2 sm:mt-0 mt-3'>
      <h1 className='sm:text-heading-h1 text-heading-h2 text-base-black break-all'>
        {config.title}
        {isDefaultUsername && (
          <span className='text-xs block text-neutral-01 mt-1'>
            This is a default username. If it's not your real name, you can change it in your
            <Link to='/account' className='text-base-black hover:underline'>
              {' '}
              account settings.
            </Link>
          </span>
        )}
      </h1>
      <p className='sm:text-neutral-01 text-body-lg text-base-black'>{description}</p>
    </div>
  );
};

export default DashboardBanner;
