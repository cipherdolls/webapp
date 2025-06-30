import { NavLink, Outlet, useRouteLoaderData } from 'react-router';
import type { Scenario, User, Avatar, AvatarsPaginated, ScenariosPaginated } from '~/types';
import type { Route } from './+types/_main._general.scenarios';
import { fetchWithAuth, fetchWithAuthAndType } from '~/utils/fetchWithAuth';
import MyScenarios from '~/components/my-scenarios';
import PublicScenarios from '~/components/public-scenarios';
import { useEffect, useState } from 'react';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';

function ScenarioSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-16 pb-5 mt-6 w-full'>
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
  const scenariosPaginated = await fetchWithAuthAndType<ScenariosPaginated>('scenarios');
  const avatarsPaginated = await fetchWithAuthAndType<AvatarsPaginated>('avatars');
  const publishedAvatarsPaginated = await fetchWithAuthAndType<AvatarsPaginated>('avatars?published=true');
  return { scenariosPaginated, avatarsPaginated, publishedAvatarsPaginated };
}

export default function ScenariosIndex({ loaderData }: Route.ComponentProps) {
  const { scenariosPaginated, avatarsPaginated, publishedAvatarsPaginated } = loaderData;
  const scenarios = scenariosPaginated.data;
  const avatars = avatarsPaginated.data;
  const publishedAvatars = publishedAvatarsPaginated.data;
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
    <div className='w-full'>
      <div className='flex items-center justify-between sm:mt-8 mb-4'>
        <h2 className='text-2xl font-semibold '>Scenarios</h2>

        <NavLink to={'/scenarios/new'}>
          <Button.Root className='px-3.5 sm:px-5 sm:h-12 h-10'>
            <Button.Icon as={Icons.add} />
            Add New Scenario
          </Button.Root>
        </NavLink>
      </div>

      <div className='flex flex-col gap-10'>
        <MyScenarios scenarios={myScenarios} />
        <PublicScenarios scenarios={scenarios} avatars={allAvatars} />
        <Outlet />
      </div>
    </div>
  );
}
