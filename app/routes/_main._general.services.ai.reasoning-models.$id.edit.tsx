import { redirect, useNavigate, useFetcher } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { ChatModel } from '~/types';
import type { Route } from './+types/_main._general.services.ai.reasoning-models.$id.edit';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import * as Modal from '~/components/ui/new-modal';
import { formatModelName } from '~/utils/formatModelName';
import ErrorsBox from '~/components/ui/input/errorsBox';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Reasoning Model' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const reasoningModelId = params.id;
  const res = await fetchWithAuth(`reasoning-models/${reasoningModelId}`);
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

    const res = await fetchWithAuth(`reasoning-models/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData),
    });

    if (!res.ok) {
      const responseData = await res.json();
      return {
        errors: responseData.message || 'Request failed',
      };
    }

    const reasoningModel: ChatModel = await res.json();
    return redirect(`/services/ai`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function ReasoningModelEdit({ loaderData }: Route.ComponentProps) {
  const reasoningModel: ChatModel = loaderData;
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const errors = fetcher.data?.errors;

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
        <Modal.Title>Edit Reasoning Model for {formatModelName(reasoningModel.providerModelName)}</Modal.Title>
        <Modal.Description className='sr-only'>
          Edit Reasoning Model for {formatModelName(reasoningModel.providerModelName)}
        </Modal.Description>
        <fetcher.Form method='PATCH' className='w-full flex flex-col mt-[18px]'>
          <Modal.Body className='flex flex-col gap-5'>
            <ErrorsBox errors={errors} />
            <input type='hidden' name='reasoningModelId' value={reasoningModel.id} />
            <input type='hidden' name='aiProviderId' value={reasoningModel.aiProviderId} />

            <Input.Root>
              <Input.Label id='providerModelName' htmlFor='providerModelName'>
                Provider Model Name
              </Input.Label>
              <Input.Input
                className='text-base-black py-3.5 px-3'
                id='providerModelName'
                name='providerModelName'
                type='text'
                defaultValue={reasoningModel.providerModelName}
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
                  defaultValue={reasoningModel.dollarPerInputToken}
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
                  defaultValue={reasoningModel.dollarPerOutputToken}
                />
              </Input.Root>
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox.Root
                className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 data-[state=checked]:bg-base-black bg-transparent outline-none focus:shadow-neutral-02'
                id='recommended'
                name='recommended'
                defaultChecked={reasoningModel.recommended}
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
