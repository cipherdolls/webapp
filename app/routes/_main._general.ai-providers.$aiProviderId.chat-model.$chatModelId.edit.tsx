import { redirect, useNavigate } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { ChatModel } from '~/types';
import type { Route } from './+types/_main._general.ai-providers.$aiProviderId.chat-model.$chatModelId.edit';
import * as Button from '~/components/ui/button/button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Drawer from '~/components/ui/drawer';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import { cn } from '~/utils/cn';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chat Models' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const chatModelId = params.chatModelId;
  const res = await fetchWithAuth(`chat-models/${chatModelId}`);
  return await res.json();
}

export default function chatModelShow({ loaderData }: Route.ComponentProps) {
  const chatModel: ChatModel = loaderData;
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/ai-providers/${chatModel.aiProviderId}`);
  };

  return (
    <Drawer.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Drawer.Content>
        <Drawer.Title>Edit Chat Model</Drawer.Title>
        <div className='size-full flex flex-col'>
          <Drawer.Body className='flex flex-col gap-3'>
            <input type='hidden' name='chatModelId' value={chatModel.id} />
            <Input.Root>
              <Input.Label id='name' htmlFor='name'>
                Name
              </Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='name'
                name='name'
                type='text'
                defaultValue={chatModel.name}
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
                defaultValue={chatModel.providerModelName}
              />
            </Input.Root>
            <div className='grid grid-cols-2 gap-3'>
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
                  defaultValue={chatModel.dollarPerInputToken}
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
                  defaultValue={chatModel.dollarPerOutputToken}
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
                defaultValue={chatModel.contextWindow}
              />
            </Input.Root>
            <div className='flex flex-col gap-2'>
              <span className='text-sm font-medium text-base-black'>Options</span>
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

            <div className='mt-4 p-4 bg-neutral-05 rounded-lg'>
              <h3 className='text-base font-semibold mb-3'>Aggregate Chat Completions</h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col'>
                  <span className='text-sm text-neutral-02 mb-1'>Average Time Taken</span>
                  <span className='text-base font-medium'>{chatModel.aggregateChatCompletions.avgTimeTakenMs} ms</span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm text-neutral-02 mb-1'>Min Time Taken</span>
                  <span className='text-base font-medium'>{chatModel.aggregateChatCompletions.minTimeTakenMs} ms</span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm text-neutral-02 mb-1'>Max Time Taken</span>
                  <span className='text-base font-medium'>{chatModel.aggregateChatCompletions.maxTimeTakenMs} ms</span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm text-neutral-02 mb-1'>Average Cost</span>
                  <span className='text-base font-medium'>${chatModel.aggregateChatCompletions.avgUsdCost.toFixed(6)}</span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm text-neutral-02 mb-1'>Min Cost</span>
                  <span className='text-base font-medium'>${chatModel.aggregateChatCompletions.minUsdCost.toFixed(6)}</span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm text-neutral-02 mb-1'>Max Cost</span>
                  <span className='text-base font-medium'>${chatModel.aggregateChatCompletions.maxUsdCost.toFixed(6)}</span>
                </div>
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
