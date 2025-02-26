import { Form, redirect, useFetcher } from 'react-router';
import type { Route } from './+types/chats.$id.destroy';
import * as Button from '~/components/ui/button';

export async function clientAction({ params }: Route.ClientActionArgs) {
  const avatarId = params.id;
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const options = {
    method: 'delete',
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
  };
  try {
    const res = await fetch(`${backendUrl}/avatars/${avatarId}`, options);
    if (!res.ok) {
      console.error('Failed to delete avatar:', res.status, res.statusText);
      return redirect('/error');
    }
    return redirect('/avatars');
  } catch (error) {
    return redirect('/signin');
  }
}

export default function AvatarDestroy() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method='post' action='destroy' className='w-full'>
      <Button.Root type='submit' variant='secondary' className='w-full'>
        Yes, delete
      </Button.Root>
    </fetcher.Form>
  );
}
