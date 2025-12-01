import { useNavigate, useSearchParams } from 'react-router';
import type { Route } from './+types/_main._general.services.ai.embedding-models.new';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Modal from '~/components/ui/new-modal';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { useCreateEmbeddingModel } from '~/hooks/queries/aiProviderMutations';
import { ROUTES } from '~/constants';
import { useState } from 'react';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Embedding Model' }];
}


export default function NewEmbeddingModel() {
  const [searchParams] = useSearchParams();
  const { mutate: createEmbeddingModel, isPending: isCreatingEmbeddingModel, error: createEmbeddingModelError } = useCreateEmbeddingModel();
  const aiProviderId = searchParams.get('id') || '';
  const name = searchParams.get('modelName') || '';
  const navigate = useNavigate();

  const [inputTokenPrice, setInputTokenPrice] = useState<string>('');
  const [outputTokenPrice, setOutputTokenPrice] = useState<string>('');

  const calculatePerMillionPrice = (pricePerToken: string): string => {
    const price = parseFloat(pricePerToken);
    if (isNaN(price) || price === 0) return '0.00';
    const millionPrice = price * 1000000;
    return millionPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const errors = createEmbeddingModelError;

  const handleClose = () => {
    navigate(`${ROUTES.services}/ai`, { replace: true });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const jsonData: Record<string, any> = Object.fromEntries(formData);
    createEmbeddingModel(jsonData, {
      onSuccess: () => handleClose(),
    });
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
        <form onSubmit={handleSubmit} encType='multipart/form-data' className='w-full flex flex-col mt-[18px]'>
          <Modal.Body className='flex flex-col gap-5'>
            <ErrorsBox errors={errors} />
            <input type='hidden' name='aiProviderId' value={aiProviderId} />

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
                  type='number'
                  step='any'
                  min='0'
                  placeholder='0.0001'
                  value={inputTokenPrice}
                  onChange={(e) => setInputTokenPrice(e.target.value)}
                />
                <span className='text-neutral-01 text-body-sm mt-1'>
                  ${calculatePerMillionPrice(inputTokenPrice)} per million tokens
                </span>
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
                  placeholder='0.0001'
                  value={outputTokenPrice}
                  onChange={(e) => setOutputTokenPrice(e.target.value)}
                />
                <span className='text-neutral-01 text-body-sm mt-1'>
                  ${calculatePerMillionPrice(outputTokenPrice)} per million tokens
                </span>
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
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
