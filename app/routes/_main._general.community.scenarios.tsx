import { Outlet, useRouteLoaderData } from 'react-router';
import type { Scenario, User, Avatar, AvatarsPaginated } from '~/types';
import type { Route } from './+types/_main._general.community.scenarios';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import MyScenarios from '~/components/my-scenarios';
import PublicScenarios from '~/components/public-scenarios';
import { useEffect, useState } from 'react';

function ScenarioSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-16 pb-5 mt-6'>
      {Array.from({ length: count }).map((_, i) => (
        <div className='flex flex-col gap-5' key={i}>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse max-w-[200px]'></div>
          <div className='grid md:gap-5 gap-3.5 grid-cols-1 sm:grid-cols-2'>
            <div className='rounded-[10px] h-[212px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[212px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[212px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[212px] bg-gradient-1 w-full animate-pulse'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Scenarios' }];
}

export async function clientLoader() {
  const [scenariosRes, avatarsRes, publishedRes] = await Promise.all([
    fetchWithAuth('scenarios'),
    fetchWithAuth('avatars'),
    fetchWithAuth('avatars?published=true'),
  ]);

  const scenarios = await scenariosRes.json();
  const avatarsPaginated = await avatarsRes.json();
  const publishedAvatarsPaginated = await publishedRes.json();

  return { scenarios, avatarsPaginated, publishedAvatarsPaginated };
}

export default function ScenariosIndex({ loaderData }: Route.ComponentProps) {
  const { scenarios, avatarsPaginated, publishedAvatarsPaginated }: { scenarios: Scenario[]; avatarsPaginated: AvatarsPaginated; publishedAvatarsPaginated: AvatarsPaginated} = loaderData;
  const avatars = avatarsPaginated.data as Avatar[];
  const publishedAvatars = publishedAvatarsPaginated.data as Avatar[];
  const allAvatars = [...publishedAvatars, ...avatars];
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

  if (!hasInitiallyLoaded || !loaderData) {
    return (
      <>
        <ScenarioSkeleton />
        <Outlet />
      </>
    );
  }

  const myScenarios = scenarios.filter((scenario) => scenario.userId === me.id);

  return (
    <>
      <MyScenarios scenarios={myScenarios} />
      <PublicScenarios scenarios={scenarios} avatars={allAvatars} />
      <Outlet />
    </>
  );
}
