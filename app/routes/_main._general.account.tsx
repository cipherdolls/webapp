import DashboardBanner from '~/components/dashboardBanner';
import { Icons } from '~/components/ui/icons';
import type { Route } from './+types/_main._general.account';
import YourAvatars from '~/components/yourAvatars';
import YourChats from '~/components/your-chats';
import YourScenarios from '~/components/your-scenarios';
import TokenBalance from '~/components/TokenBalance';
import TokenPermitsList from '~/components/TokenPermitsList';
import { useNetworkCheck } from '~/hooks/useNetworkCheck';
import NetworkWarningBanner from '~/components/NetworkWarningBanner';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Dashboard' },
    { name: 'description', content: 'Manage your avatars, scenarios and chats from your personal dashboard' },
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ];
}

export default function Dashboard() {
  const { isOnCorrectNetwork, hasMetaMask, isLoading: isNetworkLoading } = useNetworkCheck();

  const shouldShowNetworkWarning = hasMetaMask && !isNetworkLoading && !isOnCorrectNetwork;

  return (
    <div className='flex flex-col lg:gap-16 md:gap-12 gap-8 flex-1'>
      <div className='flex flex-col sm:gap-4 gap-7'>
        <h3 className='text-heading-h3 py-3 sm:block hidden'>Dashboard</h3>
        <div className='sm:hidden block ml-4.5 '>
          <Icons.mobileLogo />
        </div>

        <DashboardBanner
          variant='welcome'
          description={shouldShowNetworkWarning ? null : 'What do you want to start from?'}
          showEditLink={true}
        />

        {shouldShowNetworkWarning && <NetworkWarningBanner />}
      </div>
      <div className='grid lg:grid-cols-[1fr_352px] grid-cols-1 gap-5 pb-5'>
        <div className='flex flex-col lg:gap-10 gap-5 lg:pr-5 lg:border-r border-neutral-04'>
          <YourChats />
          <YourAvatars />
          <YourScenarios />
        </div>
        <div className='flex flex-col gap-5'>
          <TokenBalance />
          <TokenPermitsList />
        </div>
      </div>
    </div>
  );
}