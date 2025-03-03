import { Link, Outlet, redirect, useRouteLoaderData } from 'react-router';
import type { Chat, User } from '~/types';
import type { Route } from './+types/_main.chats';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export async function clientLoader() {
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const headers = {
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
  };
  try {
    const res = await fetch(`${backendUrl}/chats`, headers);
    if (!res.ok) {
      console.error('Failed to get chats', res.status, res.statusText);
      return redirect('/signin');
    }
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const body = Object.fromEntries(formData);
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const options = {
    method: 'post',
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
  try {
    const res = await fetch(`${backendUrl}/chats`, options);

    if (!res.ok) {
      console.error('Failed to create chat:', res.status, res.statusText);
      return redirect('/error');
    }
    return redirect('/chats');
  } catch (error) {
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
