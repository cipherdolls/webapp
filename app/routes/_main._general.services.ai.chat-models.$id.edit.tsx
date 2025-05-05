import { redirect, useNavigate, useFetcher } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { ChatModel } from '~/types';
import type { Route } from './+types/_main._general.services.ai.chat-models.$id.edit';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import * as Modal from '~/components/ui/new-modal';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Chat Model' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const chatModelId = params.id;
  const res = await fetchWithAuth(`chat-models/${chatModelId}`);
  return await res.json();
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const jsonData: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key === 'recommended' || key === 'censored') {
        jsonData[key] = value === 'on';
      } else {
        jsonData[key] = value;
      }
    });

    const res = await fetchWithAuth(`chat-models/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData),
    });

    if (!res.ok) {
      return await res.json();
    }

    const chatModel: ChatModel = await res.json();
    return redirect(`/services/ai`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function ChatModelEdit({ loaderData }: Route.ComponentProps) {
  const chatModel: ChatModel = loaderData;
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const handleClose = () => {
    navigate(`/services/ai`);
  };

  console.log(chatModel);

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content>
        <Modal.Title>Edit Chat Model for {chatModel.name}</Modal.Title>
        <Modal.Description className='sr-only'>Edit Chat Model for {chatModel.name}</Modal.Description>
        <fetcher.Form method='PATCH' className='size-full flex flex-col mt-[18px]'>
          <Modal.Body className='flex flex-col gap-5'>
            <input type='hidden' name='chatModelId' value={chatModel.id} />
            <input type='hidden' name='aiProviderId' value={chatModel.aiProviderId} />

            <Input.Root>
              <Input.Label id='name' htmlFor='name'>
                Model Name
              </Input.Label>
              <Input.Input className='text-base-black py-3.5 px-3' id='name' name='name' type='text' defaultValue={chatModel.name} />
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

            <div className='flex gap-2'>
              <div className='flex items-center gap-2'>
                <Checkbox.Root
                  className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 data-[state=checked]:bg-base-black bg-transparent outline-none focus:shadow-neutral-02'
                  id='recommended'
                  name='recommended'
                  defaultChecked={chatModel.recommended}
                >
                  <Checkbox.Indicator>
                    <Icons.check className='text-white size-4.5' />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label className='text-body-sm font-semibold text-neutral-01' htmlFor='recommended'>
                  Recommended
                </label>
              </div>

              <div className='flex items-center gap-2'>
                <Checkbox.Root
                  className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 data-[state=checked]:bg-base-black bg-transparent outline-none focus:shadow-neutral-02'
                  id='censored'
                  name='censored'
                  defaultChecked={chatModel.censored}
                >
                  <Checkbox.Indicator>
                    <Icons.check className='text-white size-4.5' />
                  </Checkbox.Indicator>
                </Checkbox.Root>
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
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
