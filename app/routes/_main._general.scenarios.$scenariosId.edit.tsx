import { Link, redirect, useFetcher, useNavigate } from 'react-router';
import { getPicture } from '~/utils/getPicture';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Scenario, AiProvider } from '~/types';
import type { Route } from './+types/_main._general.scenarios.$scenariosId.edit';
import * as Button from '~/components/ui/button/button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Drawer from '~/components/ui/drawer';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import * as Slider from '~/components/ui/slider';
import { useRef, useState } from 'react';
import { cn } from '~/utils/cn';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Scenario' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const scenarioId = params.scenariosId;
  const scenarioRes = await fetchWithAuth(`scenarios/${scenarioId}`);
  const scenario = await scenarioRes.json();

  const aiProvidersRes = await fetchWithAuth('ai-providers');
  const aiProviders = await aiProvidersRes.json();

  return { scenario, aiProviders };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const scenarioId = formData.get('scenarioId');

    const res = await fetchWithAuth(`scenarios/${scenarioId}`, {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      return await res.json();
    }

    const scenario: Scenario = await res.json();
    return redirect(`/scenarios/${scenario.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function ScenarioEdit({ loaderData }: Route.ComponentProps) {
  const { scenario, aiProviders } = loaderData;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(scenario.picture ?? null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preventFileOpen, setPreventFileOpen] = useState(false);

  const [temperature, setTemperature] = useState(scenario.temperature);
  const [topP, setTopP] = useState(scenario.topP);
  const [frequencyPenalty, setFrequencyPenalty] = useState(scenario.frequencyPenalty);
  const [presencePenalty, setPresencePenalty] = useState(scenario.presencePenalty);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    if (preventFileOpen) {
      e.preventDefault();
      setPreventFileOpen(false);
      return;
    }
  };

  const handleTrashClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(null);

    setPreventFileOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    navigate(`/scenarios/${scenario.id}`);
  };

  interface Option {
    label: string;
    value: string;
    recommended: boolean;
  }

  interface OptionGroup {
    groupName: string;
    options: Option[];
  }

  const getOptions = (forChatModels: boolean): OptionGroup[] => {
    let res: OptionGroup[] = [];
    if (!aiProviders) return res;

    aiProviders.forEach((aiProvider: AiProvider) => {
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
        <Drawer.Title>Edit Scenario</Drawer.Title>
        <fetcher.Form method='PATCH' encType='multipart/form-data' className='size-full flex flex-col'>
          <Drawer.Body className='flex flex-col gap-3'>
            <input type='hidden' name='scenarioId' value={scenario.id} />

            <div className='flex flex-col items-center justify-center mb-10'>
              <div className='relative'>
                <label
                  className='size-40 bg-none sm:bg-transparent bg-neutral-04 sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative'
                  onClick={handleLabelClick}
                >
                  <input ref={fileInputRef} className='hidden' type='file' name='picture' accept='image/*' onChange={handleImageChange} />
                  {selectedImage !== null ? (
                    <div className='size-full'>
                      <img
                        src={selectedImage.startsWith('blob:') ? selectedImage : getPicture(scenario, 'scenario', false)}
                        srcSet={!selectedImage.startsWith('blob:') ? getPicture(scenario, 'scenario', true) : undefined}
                        alt={scenario.name}
                        className='size-full object-cover rounded-lg'
                      />
                    </div>
                  ) : (
                    <div className='flex items-center justify-center size-full'>
                      <Icons.fileUploadIcon />
                    </div>
                  )}
                </label>
                <div className='absolute z-10 bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2'>
                  <div className='flex items-center justify-between w-full'>
                    <div
                      className={cn(
                        'py-2 px-5 flex items-center justify-center bg-base-white shadow-bottom-level-2 rounded-full',
                        (selectedImage || scenario.picture) && 'divide-x divide-neutral-04 gap-4'
                      )}
                    >
                      {selectedImage !== null && (
                        <button type='button' className='pr-4 relative z-10' onClick={handleTrashClick}>
                          <Icons.trash className='text-black' />
                        </button>
                      )}
                      <Icons.fileUpload className='cursor-pointer' onClick={() => fileInputRef.current?.click()} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Input.Root>
              <Input.Label htmlFor='shortDescription'>Short Description</Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='shortDescription'
                name='shortDescription'
                type='text'
                defaultValue={scenario.shortDescription || ''}
                placeholder='Briefly describe the scenario'
              />
              <p className='text-xs text-gray-500'>Enter a short description for this scenario (optional).</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='name'>Name</Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='name'
                name='name'
                type='text'
                defaultValue={scenario.name}
                placeholder='Movie Night'
                required
              />
              <p className='text-xs text-gray-500'>Enter the name for this scenario.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='systemMessage'>System Message</Input.Label>
              <Textarea.Textarea
                id='systemMessage'
                name='systemMessage'
                className='w-full border border-neutral-04 py-3.5 px-3 text-base-black'
                placeholder='System Message'
                defaultValue={scenario.systemMessage}
                rows={5}
                required
              />
              <p className='text-xs text-gray-500'>Provide a system message for this scenario.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='chatModelId'>Chat Model</Input.Label>
              <select
                id='chatModelId'
                name='chatModelId'
                defaultValue={scenario.chatModel.id}
                className='flex h-10 w-full rounded-md border border-neutral-04 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-01 focus:outline-none focus:ring-2 focus:ring-neutral-03 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {getOptions(true).map((group) => (
                  <optgroup key={group.groupName} label={group.groupName}>
                    {group.options.map((option: Option) => (
                      <option key={option.value} value={option.value} selected={option.value === scenario.chatModel.id}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className='text-xs text-gray-500'>Select the AI chat model for this scenario.</p>
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='embeddingModelId'>Embedding Model</Input.Label>
              <select
                id='embeddingModelId'
                name='embeddingModelId'
                defaultValue={scenario.embeddingModel.id}
                className='flex h-10 w-full rounded-md border border-neutral-04 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-01 focus:outline-none focus:ring-2 focus:ring-neutral-03 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {getOptions(false).map((group) => (
                  <optgroup key={group.groupName} label={group.groupName}>
                    {group.options.map((option: Option) => (
                      <option key={option.value} value={option.value} selected={option.value === scenario.embeddingModel.id}>
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
              Save
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
