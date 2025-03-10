import { redirect, useRouteLoaderData } from 'react-router';
import DashboardBanner from '~/components/dashboardBanner';
import { Icons } from '~/components/ui/icons';
import type { Route } from './+types/_main._general._index';
import type { Avatar, Doll, User } from '~/types';
import YourAvatars from '~/components/yourAvatars';
import YourDolls from '~/components/yourDolls';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

export async function clientLoader() {
  const [avatarsRes, dollsRes] = await Promise.all([
    fetchWithAuth('avatars'), 
    fetchWithAuth('dolls')
  ]);
  if (!avatarsRes.ok || !dollsRes.ok) {
    throw new Error('Failed to fetch data');
  }
  const avatars: Avatar[] = await avatarsRes.json();
  const dolls: Doll[] = await dollsRes.json();
  return { avatars, dolls };
}

export default function Dashbaord({ loaderData }: Route.ComponentProps) {
  const { avatars, dolls } = loaderData;
  const me = useRouteLoaderData('routes/_main') as User;

  return (
    <div className='flex flex-col lg:gap-16 md:gap-12 gap-8 flex-1'>
      <div className='flex flex-col sm:gap-4 gap-7'>
        <h3 className='text-heading-h3 py-3 sm:block hidden'>Dashboard</h3>
        <div className='sm:hidden block ml-4.5 '>
          <Icons.mobileLogo />
        </div>
        <DashboardBanner username={me.name} variant='welcome' description='What do you want to start from?' />
      </div>

      <div className='flex sm:flex-row flex-col-reverse sm:gap-0 gap-8 sm:flex-1 sm:divide-x divide-neutral-04 pb-2.5'>
        <YourAvatars avatars={avatars} />
        <YourDolls dolls={dolls} />
      </div>
    </div>
  );
}
