import { Link, Outlet, redirect, useRouteLoaderData } from 'react-router';
import type { Chat, User } from '~/types';
import type { Route } from './+types/_main.chats';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import ChatsSidebar from '~/components/ChatsSidebar';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export async function clientLoader() {
  const [chats, avatars] = await Promise.all([
    fetchWithAuth('chats').then((res) => res.json()),
    fetchWithAuth('avatars').then((res) => res.json()),
  ]);

  return { chats, avatars };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    // Convert formData to an object, then to JSON
    const formData = await request.formData();
    const bodyObj = Object.fromEntries(formData);

    if (bodyObj.avatarId && !bodyObj.scenarioId) {
      const avatarRes = await fetchWithAuth(`avatars/${bodyObj.avatarId}`);
      if (avatarRes.ok) {
        const avatar = await avatarRes.json();
        if (avatar.scenarios && (avatar.scenarios?.length || 0) > 0) {
          bodyObj.scenarioId = avatar.scenarios![0].id;
        }
      }
    }

    if (bodyObj.avatarId && bodyObj.scenarioId) {
      const existingChatsRes = await fetchWithAuth('chats');
      if (existingChatsRes.ok) {
        const existingChats: Chat[] = await existingChatsRes.json();
        const existingChat = existingChats.find((chat) => chat.avatar.id === bodyObj.avatarId && chat.scenario.id === bodyObj.scenarioId);

        if (existingChat) {
          return redirect(`/chats/${existingChat.id}`);
        }
      }
    }

    const bodyJson = JSON.stringify(bodyObj);

    // Use fetchWithAuth with your desired endpoint and options
    const res = await fetchWithAuth('chats', {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body: bodyJson,
    });

    if (!res.ok) {
      console.error('Failed to create chat:', res.status, res.statusText);
      return redirect('/error');
    }

    const chat: Chat = await res.json();
    return redirect(`/chats/${chat.id}`);
  } catch (error) {
    // If fetchWithAuth throws a redirect (e.g. token missing),
    // or any other error occurs, handle here
    return redirect('/signin');
  }
}

export default function ChatsIndex({ loaderData }: Route.ComponentProps) {
  const me = useRouteLoaderData('routes/_main') as User;
  // console.log('me in ChatsIndex', me);

  const { chats, avatars } = loaderData;
  return (
    <>
      <main className='flex flex-1 sm:py-2 sm:pr-2 overflow-hidden'>
        <div className='flex flex-1 sm:rounded-xl sm:bg-gradient-1 overflow-hidden'>
          <ChatsSidebar chats={chats} avatars={avatars} />
          <div className='flex flex-1'>
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
}
