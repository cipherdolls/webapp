import { Outlet, useRouteLoaderData } from 'react-router';
import type { Scenario, User, Avatar } from '~/types';
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
  const [scenariosRes, avatarsRes] = await Promise.all([fetchWithAuth('scenarios'), fetchWithAuth('avatars')]);

  const scenarios = await scenariosRes.json();
  const avatars = await avatarsRes.json();

  return { scenarios, avatars };
}

export default function ScenariosIndex({ loaderData }: Route.ComponentProps) {
  const { scenarios, avatars }: { scenarios: Scenario[]; avatars: Avatar[] } = loaderData;
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

  const myAvatars = avatars.filter((avatar) => avatar.userId === me.id);

  return (
    <>
      <MyScenarios scenarios={myScenarios} />
      <PublicScenarios scenarios={scenarios} avatars={myAvatars} />
      <Outlet />
    </>
  );
}
