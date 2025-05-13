import { Outlet } from 'react-router';
import type { Avatar } from '~/types';
import type { Route } from './+types/_main._general.community.avatars';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import MyAvatars from '~/components/my-avatars';
import PublicAvatars from '~/components/public-avatars';
import SearchAvatars from '~/components/ui/search-avatars';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatars' }];
}

export async function clientLoader() {
  const res = await fetchWithAuth(`avatars`);
  return await res.json();
}

export default function AiProvidersIndex({ loaderData }: Route.ComponentProps) {
  const avatars: Avatar[] = loaderData;

  return (
    <>
      <SearchAvatars />
      <MyAvatars avatars={avatars} />
      <PublicAvatars avatars={avatars} />
      <Outlet />
    </>
  );
}
