import { useNavigate } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { EmbeddingModel } from '~/types';
import type { Route } from './+types/_main._general.ai-providers.$aiProviderId.embedding-model.$embeddingModelId.edit';
import * as Button from '~/components/ui/button/button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Drawer from '~/components/ui/drawer';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import { cn } from '~/utils/cn';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Embedding Models' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const embeddingModelId = params.embeddingModelId;
  const res = await fetchWithAuth(`embedding-models/${embeddingModelId}`);
  return await res.json();
}

export default function embeddingModelShow({ loaderData }: Route.ComponentProps) {
  const embeddingModel: EmbeddingModel = loaderData;
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/embedding-models/${embeddingModel.id}`);
  };

  return (
    <Drawer.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Drawer.Content>
        <Drawer.Title>Edit Embedding Model</Drawer.Title>
        <div className='size-full flex flex-col'>
          <Drawer.Body className='flex flex-col gap-3'>
            <input type='hidden' name='embeddingModelId' value={embeddingModel.id} />

            <Input.Root>
              <Input.Label id='name' htmlFor='name'>
                Name
              </Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='name'
                name='name'
                type='text'
                defaultValue={embeddingModel.name}
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
                defaultValue={embeddingModel.providerModelName}
              />
            </Input.Root>

            <Input.Root>
              <Input.Label id='dollarPerInputToken' htmlFor='dollarPerInputToken'>
                Dollar Per Input Token
              </Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='dollarPerInputToken'
                name='dollarPerInputToken'
                type='number'
                step='0.0000001'
                defaultValue={embeddingModel.dollarPerInputToken}
              />
            </Input.Root>

            <Input.Root>
              <Input.Label id='dollarPerOutputToken' htmlFor='dollarPerOutputToken'>
                Dollar Per Output Token
              </Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='dollarPerOutputToken'
                name='dollarPerOutputToken'
                type='number'
                step='0.0000001'
                defaultValue={embeddingModel.dollarPerOutputToken}
              />
            </Input.Root>

            <div className='flex flex-col gap-2'>
              <span className='text-sm font-medium text-base-black'>Options</span>
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
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Dialog.Close asChild>
              <Button.Root aria-label='Close' className='sm:hidden block w-full'>
                Close
              </Button.Root>
            </Dialog.Close>
            <Button.Root type='button' className='w-full'>
              Save
            </Button.Root>
          </Drawer.Footer>
        </div>
        <Dialog.Close asChild>
          <button
            className='absolute focus:outline-none -left-[78px] top-4.5 size-10 bg-white rounded-full items-center justify-center z-10 sm:flex hidden'
            aria-label='Close'
          >
            <Icons.close />
          </button>
        </Dialog.Close>
      </Drawer.Content>
    </Drawer.Root>
  );
}
