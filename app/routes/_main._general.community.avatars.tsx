import { Outlet } from 'react-router';
import type { Avatar } from '~/types';
import type { Route } from './+types/_main._general.community.avatars';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import MyAvatars from '~/components/my-avatars';
import PublicAvatars from '~/components/public-avatars';
import * as Input from '~/components/ui/input/input';
import { Icons } from '~/components/ui/icons';

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
      <Input.Root>
        <Input.Icon as={Icons.search} className='size-6' />
        <Input.Input id='name' name='name' type='text' placeholder='Search your or public avatars' className='py-3.5 pl-[52px]' />
      </Input.Root>
      <MyAvatars avatars={avatars} />
      <PublicAvatars avatars={avatars} />
      <Outlet />
    </>
  );
}
