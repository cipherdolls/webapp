import { Form, redirect, useFetcher } from 'react-router';
import type { Route } from './+types/chats.$id.destroy';
import * as Button from '~/components/ui/button/button';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  try {
    const avatarId = params.id;
    const res = await fetchWithAuth(`avatars/${avatarId}`, {
      method: request.method,
    });

    if (!res.ok) {
      return await res.json();
    }
    return redirect(`/`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}


export default function AvatarDestroy() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method='DELETE' action='destroy' className='w-full'>
      <Button.Root type='submit' variant='secondary' className='w-full'>
        Yes, delete
      </Button.Root>
    </fetcher.Form>
  );
}
