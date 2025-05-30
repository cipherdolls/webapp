import { redirect, useRouteLoaderData } from 'react-router';
import DashboardBanner from '~/components/dashboardBanner';
import { Icons } from '~/components/ui/icons';
import type { Route } from './+types/_main._general._index';
import type { Avatar, Chat, Doll, Scenario, User } from '~/types';
import YourAvatars from '~/components/yourAvatars';
import YourDolls from '~/components/yourDolls';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import YourChats from '~/components/your-chats';
import YourScenarios from '~/components/your-scenarios';
import { useEffect, useState } from 'react';

function DashboardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-4 pb-5 w-full'>
      {Array.from({ length: count }).map((_, i) => (
        <div className='flex flex-col gap-4 pl-5'>
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
        <div className='flex flex-col gap-5'>
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

export async function clientLoader() {
  const [avatarsRes, dollsRes, chatsRes, scenariosRes] = await Promise.all([
    fetchWithAuth('avatars'),
    fetchWithAuth('dolls'),
    fetchWithAuth('chats'),
    fetchWithAuth('scenarios'),
  ]);
  if (!avatarsRes.ok || !dollsRes.ok || !chatsRes.ok) {
    throw new Error('Failed to fetch data');
  }
  const avatars: Avatar[] = await avatarsRes.json();
  const dolls: Doll[] = await dollsRes.json();
  const chats: Chat[] = await chatsRes.json();
  const scenarios: Scenario[] = await scenariosRes.json();
  return { avatars, dolls, chats, scenarios };
}

export default function Dashbaord({ loaderData }: Route.ComponentProps) {
  const { avatars, dolls, chats, scenarios } = loaderData;
  const me = useRouteLoaderData('routes/_main') as User;

  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

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
        <DashboardBanner username={me.name} variant='welcome' description='What do you want to start from?' />
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
          <div className=''>
            <YourDolls dolls={dolls} />
          </div>
        </div>
      )}
    </div>
  );
}
