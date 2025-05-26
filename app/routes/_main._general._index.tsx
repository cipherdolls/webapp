import { redirect, useRouteLoaderData } from 'react-router';
import DashboardBanner from '~/components/dashboardBanner';
import { Icons } from '~/components/ui/icons';
import type { Route } from './+types/_main._general._index';
import type { Avatar, Chat, Doll, Scenario, User } from '~/types';
import YourAvatars from '~/components/yourAvatars';
import YourDolls from '~/components/yourDolls';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import YourChats from '~/components/your-chats';
import YourScenarios from '~/components/your-scenarios';

export async function clientLoader() {
  const [avatarsRes, dollsRes, chatsRes, scenariosRes] = await Promise.all([
    fetchWithAuth('avatars'),
    fetchWithAuth('dolls'),
    fetchWithAuth('chats'),
    fetchWithAuth('scenarios'),
  ]);
  if (!avatarsRes.ok || !dollsRes.ok || !chatsRes.ok) {
    throw new Error('Failed to fetch data');
  }
  const avatars: Avatar[] = await avatarsRes.json();
  const dolls: Doll[] = await dollsRes.json();
  const chats: Chat[] = await chatsRes.json();
  const scenarios: Scenario[] = await scenariosRes.json();
  return { avatars, dolls, chats, scenarios };
}

export default function Dashbaord({ loaderData }: Route.ComponentProps) {
  const { avatars, dolls, chats, scenarios } = loaderData;
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

      {/* <div className='flex sm:flex-row flex-col-reverse sm:gap-0 gap-8 sm:flex-1 sm:divide-x divide-neutral-04 pb-2.5'>
        <YourAvatars avatars={avatars} />
        <YourDolls dolls={dolls} />
      </div> */}
      <div className='grid lg:grid-cols-[1fr_352px] grid-cols-1 gap-5 pb-5'>
        <div className='flex flex-col lg:gap-10 gap-5 lg:pr-5 lg:border-r border-neutral-04'>
          <YourChats chats={chats} />
          <YourAvatars avatars={avatars} />
          <YourScenarios scenarios={scenarios} />
        </div>
        <div className=''>
          <YourDolls dolls={dolls} />
        </div>
      </div>
    </div>
  );
}
