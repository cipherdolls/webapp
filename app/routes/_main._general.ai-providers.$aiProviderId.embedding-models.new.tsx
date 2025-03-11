import { redirect, useFetcher, useRouteLoaderData } from 'react-router';

import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { AiProvider, User } from '~/types';
import type { Route } from './+types/_main._general.ai-providers.$aiProviderId.embedding-models.new';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Embedding Model' }];
}

export default function aiProviderShow({ loaderData }: Route.ComponentProps) {
  const aiProvider = useRouteLoaderData('routes/_main._general.ai-providers.$aiProviderId') as AiProvider;
  const fetcher = useFetcher();

  return (

    <fetcher.Form method='POST' action="/embedding-models/new">
      <input name='aiProviderId' value={aiProvider.id}  />
      <input name='name' />
      <input name='providerModelName' />
      <input name='dollarPerInputToken' />
      <input name='dollarPerOutputToken' />
      <input name='contextWindow' />
      <input name='recommended' />
      <button type='submit'>save</button>
    </fetcher.Form>

  );
}
