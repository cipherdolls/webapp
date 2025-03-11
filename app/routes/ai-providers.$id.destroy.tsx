import { Form, redirect, useFetcher } from 'react-router';
import * as Button from '~/components/ui/button/button';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/ai-providers.$id.destroy';

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const res = await fetchWithAuth(`ai-providers/${params.id}`, {
    method: request.method,
  });
  if (!res.ok) {
    return await res.json();
  }
  return redirect(`/preferences/ai`);
}


export default function AiProviderDestroy() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method='DELETE' action='destroy' className='w-full'>
      <Button.Root type='submit' variant='secondary' className='w-full'>
        Yes, delete
      </Button.Root>
    </fetcher.Form>
  );
}
