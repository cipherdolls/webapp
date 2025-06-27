import { Outlet, useRouteLoaderData } from 'react-router';
import type { Avatar, AvatarsPaginated, User } from '~/types';
import type { Route } from './+types/_main._general.community.avatars';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import MyAvatars from '~/components/my-avatars';
import PublicAvatars from '~/components/public-avatars';
import SearchAvatars from '~/components/ui/search-avatars';
import { useEffect, useState } from 'react';

function AvatarSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-10 pb-5'>
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

  const [allAvatars, publishedAvatars] = await Promise.all([allAvatarsRes.json(), publishedAvatarsRes.json()]);

  return { allAvatars, publishedAvatars };
}

export default function AiProvidersIndex({ loaderData }: Route.ComponentProps) {
  const { allAvatarsPaginated, publishedAvatarsPaginated }: { allAvatarsPaginated: AvatarsPaginated; publishedAvatarsPaginated: AvatarsPaginated } = loaderData;
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
    <>
      <SearchAvatars />
      <MyAvatars avatars={allAvatars.filter((avatar) => avatar.userId === me.id)} />
      <PublicAvatars avatars={publishedAvatars} />
      <Outlet />
    </>
  );
}
