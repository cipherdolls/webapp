import { redirect, useFetcher, useNavigate, useSearchParams } from 'react-router';
import type { EmbeddingModel } from '~/types';
import type { Route } from './+types/_main._general.services.ai.embedding-models.new';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import * as Modal from '~/components/ui/new-modal';

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
    return redirect(`/embedding-models/${embeddingModel.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function NewEmbeddingModel() {
  const [searchParams] = useSearchParams();
  const aiProviderId = searchParams.get('id') || '';
  const name = searchParams.get('name') || '';
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/services/ai`, { replace: true });
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content>
        <Modal.Title>Add Embedding Model for {name}</Modal.Title>
        <Modal.Description className='sr-only'>Add Embedding Model for {name}</Modal.Description>
        <fetcher.Form method='POST' className='size-full flex flex-col mt-[18px]'>
          <Modal.Body className='flex flex-col gap-5'>
            <input type='hidden' name='aiProviderId' value={aiProviderId} />

            <Input.Root>
              <Input.Label id='name' htmlFor='name'>
                Model Name
              </Input.Label>
              <Input.Input className='text-base-black py-3.5 px-3' id='name' name='name' type='text' placeholder='text-embedding-3-large' />
            </Input.Root>

            <Input.Root>
              <Input.Label id='providerModelName' htmlFor='providerModelName'>
                Provider Model Name
              </Input.Label>
              <Input.Input
                className='text-base-black py-3.5 px-3'
                id='providerModelName'
                name='providerModelName'
                type='text'
                placeholder='text-embedding-3-large'
              />
            </Input.Root>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <Input.Root>
                <Input.Label id='dollarPerInputToken' htmlFor='dollarPerInputToken'>
                  $ per Input Token
                </Input.Label>
                <Input.Input
                  className='text-base-black py-3.5 px-3'
                  id='dollarPerInputToken'
                  name='dollarPerInputToken'
                  type='text'
                  placeholder='0.0001'
                />
              </Input.Root>

              <Input.Root>
                <Input.Label id='dollarPerOutputToken' htmlFor='dollarPerOutputToken'>
                  $ per Output Token
                </Input.Label>
                <Input.Input
                  className='text-base-black py-3.5 px-3'
                  id='dollarPerOutputToken'
                  name='dollarPerOutputToken'
                  type='text'
                  placeholder='0.0001'
                />
              </Input.Root>
            </div>
            <Input.Root>
              <Input.Label id='contextWindow' htmlFor='contextWindow'>
                Context Window
              </Input.Label>
              <Input.Input
                className='text-base-black py-3.5 px-3'
                id='contextWindow'
                name='contextWindow'
                type='number'
                placeholder='8192'
              />
            </Input.Root>
            <Input.Root>
              <Input.Label id='info' htmlFor='info'>
                Model description
              </Input.Label>
              <Input.Input
                className='text-base-black py-3.5 px-3'
                type='text'
                name='info'
                id='info'
                placeholder='The purpose of the model and its main feature'
              />
              <span className='text-neutral-01 text-body-sm'>Maximum of 55 characters</span>
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
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button.Root variant='secondary' aria-label='Close' className='w-full'>
                Cancel
              </Button.Root>
            </Modal.Close>
            <Button.Root type='submit' className='w-full'>
              Save
            </Button.Root>
          </Modal.Footer>
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
