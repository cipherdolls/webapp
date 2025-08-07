import { useNavigate } from 'react-router';

import type { Route } from './+types/_main._general.services.ai.chat-models.$id.edit';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import * as Modal from '~/components/ui/new-modal';
import { formatModelName } from '~/utils/formatModelName';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { useChatModel } from '~/hooks/queries/aiProviderQueries';
import { useUpdateChatModel } from '~/hooks/queries/aiProviderMutations';
import { useState } from 'react';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Chat Model' }];
}

export default function ChatModelEdit({ params }: Route.ComponentProps) {
  const chatModelId = params.id;
  const { data: chatModel, isLoading: isLoadingChatModel } = useChatModel(chatModelId);
  const { mutate: updateChatModel, isPending: isUpdatingChatModel, error: updateChatModelError } = useUpdateChatModel();
  const navigate = useNavigate();

  const [recommended, setRecommended] = useState(chatModel?.recommended);
  const [censored, setCensored] = useState(chatModel?.censored);
  

  const handleClose = () => {
    navigate(`/services/ai`);
  };

  if (isLoadingChatModel) return <div>Loading...</div>;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const jsonData: Record<string, any> = Object.fromEntries(formData);

    updateChatModel(
      { chatModelId, jsonData },
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
        {chatModel ? (
          <>
            <Modal.Title>Edit Chat Model for {formatModelName(chatModel.providerModelName)}</Modal.Title>
            <Modal.Description className='sr-only'>Edit Chat Model for {formatModelName(chatModel.providerModelName)}</Modal.Description>
            <form onSubmit={handleSubmit} encType='multipart/form-data' className='w-full flex flex-col mt-[18px]'>
              <Modal.Body className='flex flex-col gap-5'>
                <ErrorsBox errors={updateChatModelError} />
                <input type='hidden' name='chatModelId' value={chatModel.id} />
                <input type='hidden' name='aiProviderId' value={chatModel.aiProviderId} />

                <Input.Root>
                  <Input.Label id='providerModelName' htmlFor='providerModelName'>
                    Provider Model Name
                  </Input.Label>
                  <Input.Input
                    className='text-base-black py-3.5 px-3'
                    id='providerModelName'
                    name='providerModelName'
                    type='text'
                    defaultValue={chatModel.providerModelName}
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
                      defaultValue={scientificNumConvert(chatModel.dollarPerInputToken)}
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
                      defaultValue={scientificNumConvert(chatModel.dollarPerOutputToken)}
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
                    defaultValue={chatModel.contextWindow}
                  />
                </Input.Root>

                <Input.Root>
                  <Input.Label id='info' htmlFor='info'>
                    Model description
                  </Input.Label>
                  <Input.Input className='text-base-black py-3.5 px-3' type='text' name='info' id='info' defaultValue={chatModel.info} />
                  <span className='text-neutral-01 text-body-sm'>Maximum of 55 characters</span>
                </Input.Root>

                <div className='flex gap-2'>
                  <div className='flex items-center gap-2'>
                    <Checkbox.Root
                      className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 data-[state=checked]:bg-base-black bg-transparent outline-none focus:shadow-neutral-02'
                      id='recommended'
                      checked={recommended}
                      onCheckedChange={(checked) => setRecommended(checked === true)}
                    >
                      <Checkbox.Indicator>
                        <Icons.check className='text-white size-4.5' />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <input type='hidden' name='recommended' value={recommended ? 'true' : 'false'} />
                    <label className='text-body-sm font-semibold text-neutral-01' htmlFor='recommended'>
                      Recommended
                    </label>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Checkbox.Root
                      className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 data-[state=checked]:bg-base-black bg-transparent outline-none focus:shadow-neutral-02'
                      id='censored'
                      checked={censored}
                      onCheckedChange={(checked) => setCensored(checked === true)}
                    >
                      <Checkbox.Indicator>
                        <Icons.check className='text-white size-4.5' />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <input type='hidden' name='censored' value={censored ? 'true' : 'false'} />
                    <label className='text-body-sm font-semibold text-neutral-01' htmlFor='censored'>
                      Censored
                    </label>
                  </div>
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
          <p className='text-body-md text-neutral-01'>Chat model not found</p>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
