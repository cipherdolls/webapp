import { redirect, useFetcher } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/tts-providers.$ttsProvider.destroy';
import * as Button from '~/components/ui/button/button';

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const ttsProviderId = params.ttsProvider;
  const res = await fetchWithAuth(`tts-providers/${ttsProviderId}`, {
    method: request.method,
  });
  if (!res.ok) {
    return await res.json();
  }
  return redirect(`/services/tts`);
}

export default function TtsProviderDestroy() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method='DELETE' action='destroy' className='w-full'>
      <Button.Root type='submit' variant='secondary' className='w-full'>
        Yes, delete
      </Button.Root>
    </fetcher.Form>
  );
}
