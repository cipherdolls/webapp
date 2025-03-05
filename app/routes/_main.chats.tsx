import { Link, Outlet, redirect, useRouteLoaderData } from 'react-router';
import type { Chat, User } from '~/types';
import type { Route } from './+types/_main.chats';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}


export async function clientLoader() {
  try {
    const res = await fetchWithAuth(`chats`);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}


export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    // Convert formData to an object, then to JSON
    const formData = await request.formData();
    const bodyObj = Object.fromEntries(formData);
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
  console.log('me in ChatsIndex', me);

  const chats: Chat[] = loaderData;
  return (
    <>
      <main className='flex flex-1 sm:py-2 sm:pr-2'>
        <div className='flex flex-1 sm:rounded-xl sm:bg-linear-[86deg] sm:from-[rgba(254,253,248,0.56)]  sm:to-[rgba(255,255,255,0.56)]'>
          <Outlet />

          <div className='flex flex-col gap-2'>
            <h3 className='text-heading-h3'>Chats</h3>
            {chats.map((chat) => (
              <div key={chat.id} className='flex items-center justify-between'>
                <Link to={`/chats/${chat.id}`}>{chat.id}</Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
