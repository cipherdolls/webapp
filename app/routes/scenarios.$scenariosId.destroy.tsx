import { redirect, useFetcher } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/scenarios.$scenariosId.destroy';
import * as Button from '~/components/ui/button/button';

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const scenarioId = params.scenariosId;
  const res = await fetchWithAuth(`scenarios/${scenarioId}`, {
    method: request.method,
  });
  if (!res.ok) {
    return await res.json();
  }
  return redirect(`/preferences/scenarios`);
}

export default function ScenarioDestroy() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method='DELETE' action='destroy' className='w-full'>
      <Button.Root type='submit' variant='secondary' className='w-full'>
        Yes, delete
      </Button.Root>
    </fetcher.Form>
  );
}