import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.services.ai.embedding-models.$id.edit';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import * as Modal from '~/components/ui/new-modal';
import { formatModelName } from '~/utils/formatModelName';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { useEmbeddingModel } from '~/hooks/queries/aiProviderQueries';
import { useUpdateEmbeddingModel } from '~/hooks/queries/aiProviderMutations';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Embedding Model' }];
}

export default function EmbeddingModelEdit({ params }: Route.ComponentProps) {
  const { data: embeddingModel } = useEmbeddingModel(params.id);
  const { mutate: updateEmbeddingModel, isPending: isUpdatingEmbeddingModel, error: updateEmbeddingModelError } = useUpdateEmbeddingModel();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/services/ai`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const jsonData: Record<string, any> = Object.fromEntries(formData);
    updateEmbeddingModel(
      { embeddingModelId: params.id, jsonData },
      {
        onSuccess: () => handleClose(),
      }
    );
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content>
        {embeddingModel ? (
          <>
            <Modal.Title>Edit Embedding Model for {formatModelName(embeddingModel.providerModelName)}</Modal.Title>
            <Modal.Description className='sr-only'>
              Edit Embedding Model for {formatModelName(embeddingModel.providerModelName)}
            </Modal.Description>
            <form onSubmit={handleSubmit} encType='multipart/form-data' className='w-full flex flex-col mt-[18px]'>
              <Modal.Body className='flex flex-col gap-5'>
                <ErrorsBox errors={updateEmbeddingModelError} />
                <input type='hidden' name='embeddingModelId' value={embeddingModel.id} />
                <input type='hidden' name='aiProviderId' value={embeddingModel.aiProviderId} />

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
                  <Input.Label id='info' htmlFor='info'>
                    Model description
                  </Input.Label>
                  <Input.Input
                    className='text-base-black py-3.5 px-3'
                    type='text'
                    name='info'
                    id='info'
                    defaultValue={embeddingModel.info}
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
            </form>
          </>
        ) : (
          <p className='text-body-lg text-base-black text-center'>Embedding model not found</p>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
