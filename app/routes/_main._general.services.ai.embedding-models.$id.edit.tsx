import { redirect, useNavigate, useFetcher } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { EmbeddingModel } from '~/types';
import type { Route } from './+types/_main._general.services.ai.embedding-models.$id.edit';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import * as Modal from '~/components/ui/new-modal';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Embedding Model' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const embeddingModelId = params.id;
  const res = await fetchWithAuth(`embedding-models/${embeddingModelId}`);
  return await res.json();
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const jsonData: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key === 'recommended') {
        jsonData[key] = value === 'on';
      } else {
        jsonData[key] = value;
      }
    });

    const res = await fetchWithAuth(`embedding-models/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData),
    });

    if (!res.ok) {
      return await res.json();
    }

    const embeddingModel: EmbeddingModel = await res.json();
    return redirect(`/services/ai`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function EmbeddingModelEdit({ loaderData }: Route.ComponentProps) {
  const embeddingModel: EmbeddingModel = loaderData;
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/services/ai`);
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content>
        <Modal.Title>Edit Embedding Model</Modal.Title>
        <Modal.Description className='sr-only'>Edit Embedding Model</Modal.Description>
        <fetcher.Form method='PATCH' className='size-full flex flex-col mt-[18px]'>
          <Modal.Body className='flex flex-col gap-5'>
            <input type='hidden' name='embeddingModelId' value={embeddingModel.id} />
            <input type='hidden' name='aiProviderId' value={embeddingModel.aiProviderId} />

            <Input.Root>
              <Input.Label id='name' htmlFor='name'>
                Model Name
              </Input.Label>
              <Input.Input className='text-base-black py-3.5 px-3' id='name' name='name' type='text' defaultValue={embeddingModel.name} />
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
                defaultValue={embeddingModel.providerModelName}
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
                  type='number'
                  step='any'
                  min='0'
                  defaultValue={scientificNumConvert(embeddingModel.dollarPerInputToken)}
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
                  type='number'
                  step='any'
                  min='0'
                  defaultValue={scientificNumConvert(embeddingModel.dollarPerOutputToken)}
                />
              </Input.Root>
            </div>

            <Input.Root>
              <Input.Label id='description' htmlFor='description'>
                Model description
              </Input.Label>
              <Input.Input
                className='text-base-black py-3.5 px-3'
                type='text'
                name='description'
                id='description'
                placeholder='The purpose of the model and its main feature'
              />
              <span className='text-neutral-01 text-body-sm'>Maximum of 55 characters</span>
            </Input.Root>

            <div className='flex items-center gap-2'>
              <Checkbox.Root
                className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 data-[state=checked]:bg-base-black bg-transparent outline-none focus:shadow-neutral-02'
                id='recommended'
                name='recommended'
                defaultChecked={embeddingModel.recommended}
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
