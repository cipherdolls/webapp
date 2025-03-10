import { Link, redirect } from 'react-router';
import type { Avatar } from '~/types';
import type { Route } from './+types/_main._general.avatars._index';
import { useState } from 'react';
import { Icons } from '~/components/ui/icons';
import PublicAvatarCard from '~/components/PublicAvatarCard';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatars' }];
}

export async function clientLoader() {
  const res = await fetchWithAuth(`avatars?published=true`);
  return await res.json();
}

export default function AvatarsIndex({ loaderData }: Route.ComponentProps) {
  const avatars: Avatar[] = loaderData;
  return (
    <>
      <div className='flex flex-col gap-10 sm:gap-16 w-full'>
        <div className='flex items-center justify-between'>
          <Link to={'/'} className='flex items-center gap-4 text-heading-h3 font-semibold'>
            <Icons.chevronLeft />
            Public Avatars
          </Link>
        </div>
        <div className='grid w-full gap-3 sm:grid-cols-2 md:gap-5 '>
          {avatars.map((avatar) => (
            <PublicAvatarCard key={avatar.id} avatar={avatar} />
          ))}
        </div>
      </div>
    </>
  );
}
