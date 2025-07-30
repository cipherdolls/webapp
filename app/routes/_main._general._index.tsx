import { useRouteLoaderData, useFetcher } from 'react-router';
import DashboardBanner from '~/components/dashboardBanner';
import { Icons } from '~/components/ui/icons';
import type { Route } from './+types/_main._general._index';
import type { Chat, Doll, User, TokenPermitsPaginated, AvatarsPaginated, ScenariosPaginated } from '~/types';
import YourAvatars from '~/components/yourAvatars';
import YourDolls from '~/components/yourDolls';
import { fetchWithAuthAndType, fetchWithAuth } from '~/utils/fetchWithAuth';
import YourChats from '~/components/your-chats';
import YourScenarios from '~/components/your-scenarios';
import UserEditModal from '~/components/UserEditModal';
import TokenBalance from '~/components/TokenBalance';
import TokenPermitsList from '~/components/TokenPermitsList';
import { useEffect, useState } from 'react';
import { useNetworkCheck } from '~/hooks/useNetworkCheck';
import { switchToOptimismNetwork } from '~/utils/networkUtils';
import { toast } from 'sonner';
import NetworkWarningBanner from '~/components/NetworkWarningBanner';

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

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('actionType');

  if (actionType === 'createTokenPermit') {
    // Handle token permit creation
    const jsonData: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key !== 'actionType') {
        jsonData[key] = value;
      }
    });
    const res = await fetchWithAuth('token-permits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData),
    });
    return await res.json();
  } else {
    // Handle user updates
    const userId = formData.get('userId');
    const jsonData: Record<string, any> = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });
    const res = await fetchWithAuth(`users/${userId}`, {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData),
    });
    return await res.json();
  }
}

export async function clientLoader() {
  const dolls = await fetchWithAuthAndType<Doll[]>('dolls');
  const avatarsPaginated = await fetchWithAuthAndType<AvatarsPaginated>('avatars?mine=true');
  const tokenPermitsPaginated = await fetchWithAuthAndType<TokenPermitsPaginated>('token-permits?limit=1&page=1');
  const scenariosPaginated = await fetchWithAuthAndType<ScenariosPaginated>('scenarios');
  const chats = await fetchWithAuthAndType<Chat[]>('chats');
  return { dolls, avatarsPaginated, tokenPermitsPaginated, scenariosPaginated, chats };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { avatarsPaginated, dolls, chats, scenariosPaginated, tokenPermitsPaginated } = loaderData;
  const avatars = avatarsPaginated.data;
  const scenarios = scenariosPaginated.data;
  const tokenPermits = tokenPermitsPaginated.data;

  const me = useRouteLoaderData('routes/_main') as User;
  const fetcher = useFetcher();
  const { isOnCorrectNetwork, hasMetaMask, isLoading: isNetworkLoading } = useNetworkCheck();

  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  useEffect(() => {
    if (loaderData) {
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [loaderData]);

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

  const handleRefreshBalance = () => {
    const formData = new FormData();
    formData.append('userId', me.id);
    formData.append('signerAddress', me.signerAddress);
    formData.append('action', 'RefreshTokenBalance');

    fetcher.submit(formData, { method: 'PATCH' });
  };

  const isRefreshingBalance = fetcher.state === 'submitting' && fetcher.formData?.get('action') === 'RefreshTokenBalance';

  const shouldShowNetworkWarning = hasMetaMask && !isNetworkLoading && !isOnCorrectNetwork;

  console.log(avatars);

  return (
    <div className='flex flex-col lg:gap-16 md:gap-12 gap-8 flex-1'>
      <div className='flex flex-col sm:gap-4 gap-7'>
        <h3 className='text-heading-h3 py-3 sm:block hidden'>Dashboard</h3>
        <div className='sm:hidden block ml-4.5 '>
          <Icons.mobileLogo />
        </div>

        <DashboardBanner
          username={me.name}
          variant='welcome'
          description={shouldShowNetworkWarning ? null : 'What do you want to start from?'}
          showEditLink={true}
          onEditClick={() => setIsUserEditModalOpen(true)}
        />

        {shouldShowNetworkWarning && <NetworkWarningBanner onSwitchNetwork={handleSwitchNetwork} isLoading={isSwitchingNetwork} />}
      </div>
      {!hasInitiallyLoaded || !loaderData ? (
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
            <YourChats chats={chats} />
            <YourAvatars avatars={avatars} chats={chats} />
            <YourScenarios scenarios={scenarios} />
          </div>
          <div className='flex flex-col gap-5'>
            <TokenBalance balance={me.tokenBalance || '0'} onRefresh={handleRefreshBalance} isRefreshing={isRefreshingBalance} />
            <TokenPermitsList
              permits={tokenPermits}
              fetcher={fetcher}
              tokenBalance={me.tokenBalance || '0'}
              allowance={me.tokenAllowance}
            />
            <YourDolls dolls={dolls} />
          </div>
        </div>
      )}

      <UserEditModal me={me} fetcher={fetcher} open={isUserEditModalOpen} onOpenChange={setIsUserEditModalOpen} />
    </div>
  );
}
