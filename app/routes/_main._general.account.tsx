import { Outlet } from 'react-router';
import DashboardBanner from '~/components/dashboardBanner';
import { Icons } from '~/components/ui/icons';
import type { Route } from './+types/_main._general.account';
import YourAvatars from '~/components/yourAvatars';
import YourChats from '~/components/your-chats';
import YourScenarios from '~/components/your-scenarios';
import Dolls from '~/components/dolls';
import TokenBalance from '~/components/TokenBalance';
import TokenPermitsList from '~/components/TokenPermitsList';
import { useNetworkCheck } from '~/hooks/useNetworkCheck';
import NetworkWarningBanner from '~/components/NetworkWarningBanner';
import { YourReferrals } from '~/components/your-referrals';

import * as Button from '~/components/ui/button/button';
import { useAuthStore } from '~/store/useAuthStore';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { YourWallet } from '~/components/your-wallet';
import { YourGift } from '~/components/your-gift';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Account' },
    { name: 'description', content: 'Manage your avatars, scenarios and chats from your personal account' },
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ];
}

export default function Account() {
  const { isOnCorrectNetwork, hasMetaMask, isLoading: isNetworkLoading } = useNetworkCheck();
  const confirm = useConfirm();
  const { isAuthenticated, isUsingBurnerWallet } = useAuthStore();

  const shouldShowNetworkWarning = hasMetaMask && !isNetworkLoading && !isOnCorrectNetwork;

  const logout = useAuthStore((state) => state.logout);

  const handleSignOut = async () => {
    const result = await confirm({
      icon: '🏁',
      title: 'Sign Out?',
      body: 'Are you sure you want to sign out?',
      actionButton: 'Yes, Sign Out',
      cancelButton: 'No, Stay',
    });

    if (!result) return;

    logout();
  };

  return (
    <div className='flex flex-col lg:gap-16 md:gap-12 gap-8 flex-1'>
      <div className='flex flex-col sm:gap-4 gap-7'>
        <h3 className='text-heading-h3 py-3 sm:block hidden'>Account</h3>
        <div className='sm:hidden block ml-4.5 '>
          <Icons.mobileLogo />
        </div>

        <DashboardBanner description={shouldShowNetworkWarning ? null : 'What do you want to start from?'} showEditLink={true} />

        {shouldShowNetworkWarning && <NetworkWarningBanner />}
      </div>
      <div className='grid lg:grid-cols-[1fr_352px] grid-cols-1 gap-5 pb-5'>
        <div className='flex flex-col lg:gap-10 gap-5 lg:pr-5 lg:border-r border-neutral-04'>
          <YourChats />
          <YourAvatars />
          <YourScenarios />
          <Dolls />
        </div>
        <div className='flex flex-col gap-5 lg:sticky lg:top-4 lg:self-start'>
          <YourWallet disabled={isUsingBurnerWallet} />
          <YourGift disabled={isUsingBurnerWallet} />
          {/*<TokenBalance />*/}
          {/*<TokenPermitsList />*/}
          <YourReferrals disabled={isUsingBurnerWallet} />

          <Button.Root variant='primary' className='w-full min-h-12' onClick={handleSignOut}>
            <Icons.signOut />
            Sign Out
          </Button.Root>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
