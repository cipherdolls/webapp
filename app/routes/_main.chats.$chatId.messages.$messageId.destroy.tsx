import { redirect, useFetcher } from 'react-router';
import type { Route } from './+types/_main.chats.$chatId.messages.$messageId.destroy';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import * as Button from '~/components/ui/button/button';

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const res = await fetchWithAuth(`messages/${params.messageId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    return await res.json();
  }

  return redirect(`/chats/${params.chatId}`);
}

export default function MessageDestroy() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method='DELETE' action='destroy'>
      <Button.Root type='submit' variant='danger' className='w-full px-10'>
        Delete Message
      </Button.Root>
    </fetcher.Form>
  );
}
