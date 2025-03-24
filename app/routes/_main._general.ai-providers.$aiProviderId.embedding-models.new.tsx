import { redirect, useFetcher, useNavigate, useRouteLoaderData } from 'react-router';

import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { AiProvider, EmbeddingModel, User } from '~/types';
import type { Route } from './+types/_main._general.ai-providers.$aiProviderId.embedding-models.new';
import * as Button from '~/components/ui/button/button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Drawer from '~/components/ui/drawer';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Embedding Model' }];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const jsonData: Record<string, any> = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });
    const res = await fetchWithAuth('embedding-models', {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData),
    });

    if (!res.ok) {
      return await res.json();
    }
    const embeddingModel: EmbeddingModel = await res.json();
    return redirect(`/ai-providers/${embeddingModel.aiProviderId}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function aiProviderShow({ loaderData }: Route.ComponentProps) {
  const aiProvider = useRouteLoaderData('routes/_main._general.ai-providers.$aiProviderId') as AiProvider;
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/ai-providers/${aiProvider.id}`);
  };

  return (
    <Drawer.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Drawer.Content>
        <Drawer.Title>Add New Embedding Model for {aiProvider.name}</Drawer.Title>
        <fetcher.Form method='POST' className='size-full flex flex-col'>
          <Drawer.Body className='flex flex-col gap-3'>
            <input type='hidden' name='aiProviderId' value={aiProvider.id} />

            <Input.Root>
              <Input.Label id='name' htmlFor='name'>
                Embedding Model Name
              </Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='name'
                name='name'
                type='text'
                placeholder='GPT-4.5'
              />
            </Input.Root>

            <Input.Root>
              <Input.Label id='providerModelName' htmlFor='providerModelName'>
                Provider Model Name
              </Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='providerModelName'
                name='providerModelName'
                type='text'
                placeholder='Deepseek'
              />
            </Input.Root>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <Input.Root>
                <Input.Label id='dollarPerInputToken' htmlFor='dollarPerInputToken'>
                  $ per Input Token
                </Input.Label>
                <Input.Input
                  className='text-base-black border border-neutral-04 py-3.5 px-3'
                  id='dollarPerInputToken'
                  name='dollarPerInputToken'
                  type='number'
                  placeholder='0.0001'
                  step='any'
                />
              </Input.Root>

              <Input.Root>
                <Input.Label id='dollarPerOutputToken' htmlFor='dollarPerOutputToken'>
                  $ per Output Token
                </Input.Label>
                <Input.Input
                  className='text-base-black border border-neutral-04 py-3.5 px-3'
                  id='dollarPerOutputToken'
                  name='dollarPerOutputToken'
                  type='number'
                  placeholder='0.0001'
                  step='any'
                />
              </Input.Root>
            </div>
            <Input.Root>
              <Input.Label id='contextWindow' htmlFor='contextWindow'>
                Context Window
              </Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='contextWindow'
                name='contextWindow'
                type='number'
                placeholder='8192'
              />
            </Input.Root>

            <div className='flex items-center gap-2'>
              <Checkbox.Root
                className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 data-[state=checked]:bg-base-black bg-transparent outline-none focus:shadow-neutral-02'
                id='recommended'
                name='recommended'
              >
                <Checkbox.Indicator>
                  <Icons.check className='text-white size-4.5' />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label className='text-body-sm font-semibold text-neutral-01' htmlFor='recommended'>
                Recommended
              </label>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Dialog.Close asChild>
              <Button.Root aria-label='Close' className='sm:hidden block w-full'>
                Close
              </Button.Root>
            </Dialog.Close>
            <Button.Root type='submit' className='w-full'>
              Save
            </Button.Root>
          </Drawer.Footer>
        </fetcher.Form>
        <Dialog.Close asChild>
          <button
            className='absolute focus:outline-none -left-[78px] top-4.5 size-10 bg-white rounded-full items-center justify-center z-10 sm:flex hidden'
            aria-label='Close'
          >
            <Icons.close className='text-base-black' />
          </button>
        </Dialog.Close>
      </Drawer.Content>
    </Drawer.Root>
  );
}
