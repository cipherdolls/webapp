import { useRouteLoaderData } from 'react-router';
import DashboardBanner from '~/components/dashboardBanner';
import { Icons } from '~/components/ui/icons';
import type { Route } from './+types/_main._general._index';
import type { User } from '~/types';
import YourAvatars from '~/components/yourAvatars';
import YourDolls from '~/components/yourDolls';
import YourChats from '~/components/your-chats';
import YourScenarios from '~/components/your-scenarios';
import UserEditModal from '~/components/UserEditModal';
import TokenBalance from '~/components/TokenBalance';
import TokenPermitsList from '~/components/TokenPermitsList';
import { useState } from 'react';
import { useNetworkCheck } from '~/hooks/useNetworkCheck';
import { switchToOptimismNetwork } from '~/utils/networkUtils';
import { toast } from 'sonner';
import NetworkWarningBanner from '~/components/NetworkWarningBanner';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { useUser } from '~/hooks/queries/userQueries';
import { useRealtimeSync } from '~/hooks/useRealtimeSync';

function DashboardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-4 pb-5 w-full'>
      <div className='rounded-xl h-20 bg-gradient-1 w-full animate-pulse'></div>
      <div className='rounded-xl h-32 bg-gradient-1 w-full animate-pulse'></div>
      {Array.from({ length: count }).map((_, i) => (
        <div className='flex flex-col gap-4 pl-5' key={i}>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse max-w-[110px]'></div>
          <div className='rounded-[10px] h-[276px] bg-gradient-1 w-full animate-pulse '></div>
        </div>
      ))}
    </div>
  );
}

function LeftSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className='flex flex-col lg:gap-10 gap-5 lg:pr-5'>
      {Array.from({ length: count }).map((_, i) => (
        <div className='flex flex-col gap-5' key={i}>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse max-w-[110px]'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
            <div className='rounded-[10px] h-20 bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-20 bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-20 bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-20 bg-gradient-1 w-full animate-pulse'></div>
          </div>
          <div className='-mt-2 mx-auto'>
            <div className='rounded-[10px] h-10 bg-gradient-1 w-[118px] animate-pulse'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Dashboard' }];
}

export default function Dashboard() {
  const me = useRouteLoaderData('routes/_main') as User;
  const { isOnCorrectNetwork, hasMetaMask, isLoading: isNetworkLoading } = useNetworkCheck();

  // TanStack Query hooks
  const { data: user, isLoading: userLoading } = useUser();
  const { data: chatsData } = useChats();
  const { data: avatarsData } = useAvatars();
  
  // Mutations

  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  const currentUser = user || me;

  // Enable real-time sync
  useRealtimeSync({ userId: user?.id });

  // Loading state
  const isLoading = userLoading;

  const handleSwitchNetwork = async () => {
    setIsSwitchingNetwork(true);
    try {
      const result = await switchToOptimismNetwork();
      if (!result.success) {
        toast.error(result.error || 'Failed to switch network');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while switching networks');
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const shouldShowNetworkWarning = hasMetaMask && !isNetworkLoading && !isOnCorrectNetwork;

  return (
    <div className='flex flex-col lg:gap-16 md:gap-12 gap-8 flex-1'>
      <div className='flex flex-col sm:gap-4 gap-7'>
        <h3 className='text-heading-h3 py-3 sm:block hidden'>Dashboard</h3>
        <div className='sm:hidden block ml-4.5 '>
          <Icons.mobileLogo />
        </div>

        <DashboardBanner
          username={currentUser.name}
          variant='welcome'
          description={shouldShowNetworkWarning ? null : 'What do you want to start from?'}
          showEditLink={true}
          onEditClick={() => setIsUserEditModalOpen(true)}
        />

        {shouldShowNetworkWarning && <NetworkWarningBanner onSwitchNetwork={handleSwitchNetwork} isLoading={isSwitchingNetwork} />}
      </div>
      {isLoading ? (
        <div className='grid lg:grid-cols-[1fr_352px] grid-cols-1 gap-5 pb-5'>
          <div className='flex flex-col lg:gap-10 gap-5 lg:pr-5 lg:border-r border-neutral-04'>
            <LeftSkeleton />
          </div>
          <div className=''>
            <DashboardSkeleton />
          </div>
        </div>
      ) : (
        <div className='grid lg:grid-cols-[1fr_352px] grid-cols-1 gap-5 pb-5'>
          <div className='flex flex-col lg:gap-10 gap-5 lg:pr-5 lg:border-r border-neutral-04'>
            <YourChats chats={chatsData || []} avatars={avatarsData || []} />
            <YourAvatars />
            <YourScenarios />
          </div>
          <div className='flex flex-col gap-5'>
            <TokenBalance user={currentUser} />
            <TokenPermitsList user={currentUser} />
            <YourDolls />
          </div>
        </div>
      )}

      <UserEditModal me={currentUser} open={isUserEditModalOpen} onOpenChange={setIsUserEditModalOpen} />
    </div>
  );
}
