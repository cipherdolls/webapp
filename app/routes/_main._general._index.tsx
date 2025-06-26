import { useRouteLoaderData, useFetcher } from 'react-router';
import DashboardBanner from '~/components/dashboardBanner';
import { Icons } from '~/components/ui/icons';
import type { Route } from './+types/_main._general._index';
import type { Avatar, Chat, Doll, Scenario, User } from '~/types';
import YourAvatars from '~/components/yourAvatars';
import YourDolls from '~/components/yourDolls';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import YourChats from '~/components/your-chats';
import YourScenarios from '~/components/your-scenarios';
import UserEditModal from '~/components/UserEditModal';
import TokenBalance from '~/components/TokenBalance';
import { useEffect, useState } from 'react';

function DashboardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-4 pb-5 w-full'>
      {/* Token Balance Skeleton */}
      <div className='rounded-xl h-20 bg-gradient-1 w-full animate-pulse'></div>
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

export async function clientLoader() {
  const [avatarsRes, dollsRes, chatsRes, scenariosRes, tokenBalanceRes] = await Promise.all([
    fetchWithAuth('avatars'),
    fetchWithAuth('dolls'),
    fetchWithAuth('chats'),
    fetchWithAuth('scenarios'),
    fetchWithAuth('token/balance'),
  ]);
  if (!avatarsRes.ok || !dollsRes.ok || !chatsRes.ok || !scenariosRes.ok) {
    throw new Error('Failed to fetch data');
  }
  const avatars: Avatar[] = await avatarsRes.json();
  const dolls: Doll[] = await dollsRes.json();
  const chats: Chat[] = await chatsRes.json();
  const scenarios: Scenario[] = await scenariosRes.json();
  const tokenBalance = tokenBalanceRes.ok ? await tokenBalanceRes.json() : { balance: '0' };
  return { avatars, dolls, chats, scenarios, tokenBalance };
}

export default function Dashbaord({ loaderData }: Route.ComponentProps) {
  const { avatars, dolls, chats, scenarios, tokenBalance } = loaderData;
  const me = useRouteLoaderData('routes/_main') as User;
  const fetcher = useFetcher();

  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);

  useEffect(() => {
    if (loaderData) {
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [loaderData]);

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
          description='What do you want to start from?'
          showEditLink={true}
          onEditClick={() => setIsUserEditModalOpen(true)}
        />
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
            <YourAvatars avatars={avatars} />
            <YourScenarios scenarios={scenarios} />
          </div>
          <div className='flex flex-col gap-5'>
            <TokenBalance balance={tokenBalance?.balance || '0'} />
            <YourDolls dolls={dolls} />
          </div>
        </div>
      )}

      <UserEditModal me={me} fetcher={fetcher} open={isUserEditModalOpen} onOpenChange={setIsUserEditModalOpen} />
    </div>
  );
}
