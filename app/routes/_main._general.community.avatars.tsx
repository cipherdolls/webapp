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
  const [allAvatarsRes, publishedAvatarsRes] = await Promise.all([
    fetchWithAuth(`avatars`),
    fetchWithAuth(`avatars?published=true`)
  ]);
  
  const [allAvatars, publishedAvatars] = await Promise.all([
    allAvatarsRes.json(),
    publishedAvatarsRes.json()
  ]);
  
  return { allAvatars, publishedAvatars };
}

export default function AiProvidersIndex({ loaderData }: Route.ComponentProps) {
  const { allAvatars, publishedAvatars }: { allAvatars: Avatar[], publishedAvatars: Avatar[] } = loaderData;

  return (
    <>
      <SearchAvatars />
      <MyAvatars avatars={allAvatars} />
      <PublicAvatars avatars={publishedAvatars} />
      <Outlet />
    </>
  );
}
