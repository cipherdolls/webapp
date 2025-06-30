import { NavLink, Outlet, useRouteLoaderData } from 'react-router';
import type { Avatar, AvatarsPaginated, User } from '~/types';
import type { Route } from './+types/_main._general.avatars';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import MyAvatars from '~/components/my-avatars';
import PublicAvatars from '~/components/public-avatars';
import SearchAvatars from '~/components/ui/search-avatars';
import { useEffect, useState } from 'react';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';

function AvatarSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-10 pb-5 w-full'>
      <div className='rounded-[10px] h-[52px] bg-gradient-1 w-full animate-pulse mb-8'></div>
      {Array.from({ length: count }).map((_, i) => (
        <div className='flex flex-col gap-5' key={i}>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse max-w-[200px]'></div>
          <div className='grid md:gap-5 gap-3.5 grid-cols-1 sm:grid-cols-2'>
            <div className='rounded-[10px] h-[112px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[112px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[112px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[112px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatars' }];
}

export async function clientLoader() {
  const [allAvatarsRes, publishedAvatarsRes] = await Promise.all([fetchWithAuth(`avatars`), fetchWithAuth(`avatars?published=true`)]);
  const [allAvatarsPaginated, publishedAvatarsPaginated] = await Promise.all([allAvatarsRes.json(), publishedAvatarsRes.json()]);
  return { allAvatarsPaginated, publishedAvatarsPaginated };
}

export default function AiProvidersIndex({ loaderData }: Route.ComponentProps) {
  const {
    allAvatarsPaginated,
    publishedAvatarsPaginated,
  }: { allAvatarsPaginated: AvatarsPaginated; publishedAvatarsPaginated: AvatarsPaginated } = loaderData;
  const allAvatars = allAvatarsPaginated.data as Avatar[];
  const publishedAvatars = publishedAvatarsPaginated.data as Avatar[];

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
        <AvatarSkeleton />
        <Outlet />
      </>
    );
  }

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between sm:mt-8 mb-4'>
        <h2 className='text-2xl font-semibold '>Avatars</h2>

        <NavLink to={'/avatars/new'}>
          <Button.Root className='px-3.5 sm:px-5 sm:h-12 h-10'>
            <Button.Icon as={Icons.add} />
            Add New Avatar
          </Button.Root>
        </NavLink>
      </div>

      <div className='flex flex-col gap-10'>
        <SearchAvatars />
        <MyAvatars avatars={allAvatars.filter((avatar) => avatar.userId === me.id)} />
        <PublicAvatars avatars={publishedAvatars} />
        <Outlet />
      </div>
    </div>
  );
}
