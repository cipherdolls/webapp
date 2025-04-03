import { redirect, useFetcher, useNavigate, useParams } from 'react-router';

import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.preferences.scenarios.new';
import * as Button from '~/components/ui/button/button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Drawer from '~/components/ui/drawer';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import { useState } from 'react';
import type { AiProvider } from '~/types';
import * as Textarea from '~/components/ui/input/textarea';
import * as Slider from '~/components/ui/slider';
import ErrorsBox from '~/components/ui/input/errorsBox';

interface Option {
  label: string;
  value: string;
  recommended: boolean;
}

interface OptionGroup {
  groupName: string;
  options: Option[];
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Scenario' }];
}

export async function clientLoader() {
  const res = await fetchWithAuth('ai-providers');
  return await res.json();
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const res = await fetchWithAuth('scenarios', {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      const responseData = await res.json();
      return {
        errors: responseData.message || 'Request failed'
      };
    }

    const scenario = await res.json();
    return redirect(`/preferences/scenarios`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function ScenarioNew({ loaderData }: Route.ComponentProps) {
  const aiProviders = loaderData as AiProvider[];
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [temperature, setTemperature] = useState(0.2);
  const [topP, setTopP] = useState(1);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.2);
  const [presencePenalty, setPresencePenalty] = useState(0.2);

  const { avatarId } = useParams();
  
  const errors = fetcher.data?.errors;

  const handleClose = () => {
    navigate(`/preferences/scenarios`);
  };

  const getOptions = (forChatModels: boolean): OptionGroup[] => {
    let res: OptionGroup[] = [];
    if (!aiProviders) return res;

    aiProviders.forEach((aiProvider) => {
      let newOptionGroup: OptionGroup = { groupName: aiProvider.name, options: [] };
      const modelsArr = forChatModels ? aiProvider.chatModels : aiProvider.embeddingModels;

      if (!modelsArr || modelsArr.length === 0) {
        return;
      }

      modelsArr.forEach((model) => {
        newOptionGroup.options.push({
          label: model.name,
          value: model.id,
          recommended: model.recommended,
        });
      });

      res.push(newOptionGroup);
    });
    return res;
  };

  return (
    <Drawer.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Drawer.Content>
        <Drawer.Title>Create Scenario</Drawer.Title>
        <fetcher.Form method='post' encType='multipart/form-data' className='size-full flex flex-col'>
          <input type='text' name='avatarId' value={avatarId} readOnly hidden />

          <Drawer.Body className='flex flex-col gap-4 md:gap-6'>
            <ErrorsBox errors={errors} />
            <div className='grid gap-3'>
              <Input.Label htmlFor='shortDescription'>Short Description</Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='shortDescription'
                name='shortDescription'
                type='text'
                placeholder='Briefly describe the scenario'
              />
              <p className='text-xs text-gray-500'>Enter a short description for the new scenario.</p>
            </div>

            <Input.Root>
              <Input.Label htmlFor='name'>Name</Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='name'
                name='name'
                type='text'
                placeholder='Movie Night'
              />
              <p className='text-xs text-gray-500'>Enter the name for the new scenario.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='systemMessage'>System Message</Input.Label>
              <Textarea.Textarea
                id='systemMessage'
                name='systemMessage'
                className='w-full border border-neutral-04 py-3.5 px-3'
                placeholder='System Message'
                rows={5}
              />
              <p className='text-xs text-gray-500'>Provide a system message for this new scenario.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='chatModelId'>Chat Model</Input.Label>
              <select
                id='chatModelId'
                name='chatModelId'
                className='flex h-10 w-full rounded-md border border-neutral-04 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-01 focus:outline-none focus:ring-2 focus:ring-neutral-03 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {getOptions(true).map((group) => (
                  <optgroup key={group.groupName} label={group.groupName}>
                    {group.options.map((option: any) => (
                      <option key={option.value} value={option.value} selected={option.recommended}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className='text-xs text-gray-500'>Select the AI chat model for this new scenario.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='embeddingModelId'>Embedding Model</Input.Label>
              <select
                id='embeddingModelId'
                name='embeddingModelId'
                className='flex h-10 w-full rounded-md border border-neutral-04 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-01 focus:outline-none focus:ring-2 focus:ring-neutral-03 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {getOptions(false).map((group) => (
                  <optgroup key={group.groupName} label={group.groupName}>
                    {group.options.map((option: any) => (
                      <option key={option.value} value={option.value} selected={option.recommended}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className='text-xs text-gray-500'>Select the embedding model for similarity search.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='temperature'>Temperature</Input.Label>
              <Slider.Root
                id='temperature'
                name='temperature'
                defaultValue={[temperature]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => setTemperature(value[0])}
              >
                <Slider.Thumb />
              </Slider.Root>
              <span className='text-xs text-gray-600'>Current Value: {temperature}</span>
              <p className='text-xs text-gray-500'>Controls randomness in the model's output.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='topP'>TopP</Input.Label>
              <Slider.Root
                id='topP'
                name='topP'
                defaultValue={[topP]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => setTopP(value[0])}
              >
                <Slider.Thumb />
              </Slider.Root>
              <span className='text-xs text-gray-600'>Current Value: {topP}</span>
              <p className='text-xs text-gray-500'>Controls content diversity by selecting from the top probability mass.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='frequencyPenalty'>Frequency Penalty</Input.Label>
              <Slider.Root
                id='frequencyPenalty'
                name='frequencyPenalty'
                defaultValue={[frequencyPenalty]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => setFrequencyPenalty(value[0])}
              >
                <Slider.Thumb />
              </Slider.Root>
              <span className='text-xs text-gray-600'>Current Value: {frequencyPenalty}</span>
              <p className='text-xs text-gray-500'>Reduces repetition by penalizing similar phrases.</p>
            </Input.Root>

            {/* Presence Penalty */}
            <Input.Root>
              <Input.Label htmlFor='presencePenalty'>Presence Penalty</Input.Label>
              <Slider.Root
                id='presencePenalty'
                name='presencePenalty'
                defaultValue={[presencePenalty]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => setPresencePenalty(value[0])}
              >
                <Slider.Thumb />
              </Slider.Root>
              <span className='text-xs text-gray-600'>Current Value: {presencePenalty}</span>
              <p className='text-xs text-gray-500'>Encourages creativity by penalizing new concepts.</p>
            </Input.Root>
          </Drawer.Body>

          <Drawer.Footer>
            <Dialog.Close asChild>
              <Button.Root aria-label='Close' className='sm:hidden block w-full'>
                Close
              </Button.Root>
            </Dialog.Close>
            <Button.Root type='submit' className='w-full'>
              Create Scenario
            </Button.Root>
          </Drawer.Footer>
        </fetcher.Form>
        <Dialog.Close asChild>
          <button
            className='absolute focus:outline-none -left-[78px] top-4.5 size-10 bg-white rounded-full items-center justify-center z-10 sm:flex hidden'
            aria-label='Close'
            onClick={handleClose}
          >
            <Icons.close className='text-base-black' />
          </button>
        </Dialog.Close>
      </Drawer.Content>
    </Drawer.Root>
  );
}
