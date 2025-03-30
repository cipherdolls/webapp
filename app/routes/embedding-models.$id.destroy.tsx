import { Form, redirect, useFetcher } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/embedding-models.$id.destroy';
import * as Button from '~/components/ui/button/button';

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const res = await fetchWithAuth(`embedding-models/${params.id}`, {
    method: request.method,
  });
  if (!res.ok) {
    return await res.json();
  }
  return redirect(`/preferences/ai`);
}

export default function EmbeddingModelDestroy() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method='DELETE' action='destroy'>
      <Button.Root type='submit' variant='secondary' className='w-full'>
        Yes, delete
      </Button.Root>
    </fetcher.Form>
  );
}
