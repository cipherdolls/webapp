import { redirect, useNavigate, useSearchParams } from 'react-router';
import type { ChatModel } from '~/types';
import type { Route } from './+types/_main._general.services.ai.reasoning-models.new';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import * as Modal from '~/components/ui/new-modal';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { useCreateReasoningModel } from '~/hooks/queries/aiProviderMutations';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Reasoning Model' }];
}


export default function NewReasoningModel() {
  const { mutate: createReasoningModel, isPending: isCreatingReasoningModel, error: createReasoningModelError } = useCreateReasoningModel();
  const [searchParams] = useSearchParams();
  const aiProviderId = searchParams.get('id') || '';
  const name = searchParams.get('modelName') || '';
  const navigate = useNavigate();

  const errors = createReasoningModelError;

  const handleClose = () => {
    navigate(`/services/ai`, { replace: true });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const jsonData = Object.fromEntries(formData);
    createReasoningModel(jsonData, {
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
        <Modal.Title>Add Reasoning Model for {name}</Modal.Title>
        <Modal.Description className='sr-only'>Add Reasoning Model for {name}</Modal.Description>
        <form onSubmit={handleSubmit} encType='multipart/form-data' className='w-full flex flex-col mt-[18px]'>
          <Modal.Body className='flex flex-col gap-5'>
            <ErrorsBox errors={errors} />
            <input type='hidden' name='aiProviderId' value={aiProviderId} />

            <Input.Root>
              <Input.Label id='providerModelName' htmlFor='providerModelName'>
                Provider Model Name
              </Input.Label>
              <Input.Input
                className='text-base-black  py-3.5 px-3'
                id='providerModelName'
                name='providerModelName'
                type='text'
                placeholder='gpt-4o-reasoning'
              />
            </Input.Root>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <Input.Root>
                <Input.Label id='dollarPerInputToken' htmlFor='dollarPerInputToken'>
                  $ per Input Token
                </Input.Label>
                <Input.Input
                  className='text-base-black  py-3.5 px-3'
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
                  className='text-base-black  py-3.5 px-3'
                  id='dollarPerOutputToken'
                  name='dollarPerOutputToken'
                  type='text'
                  placeholder='0.0001'
                />
              </Input.Root>
            </div>
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
