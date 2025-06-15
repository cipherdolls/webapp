import { redirect, useFetcher, useNavigate, useParams } from 'react-router';

import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.community.scenarios.new';
import * as Button from '~/components/ui/button/button';

import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import { Fragment, useRef, useState } from 'react';
import type { AiProvider } from '~/types';
import * as Textarea from '~/components/ui/input/textarea';
import * as Select from '~/components/ui/input/select';
import * as Slider from '~/components/ui/slider';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { formatModelName } from '~/utils/formatModelName';
import * as Modal from '~/components/ui/new-modal';
import { InformationBadge } from '~/components/ui/InformationBadge';
import { cn } from '~/utils/cn';

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
  const [aiProvidersRes, reasoningModelsRes] = await Promise.all([fetchWithAuth('ai-providers'), fetchWithAuth('reasoning-models')]);

  const aiProviders = await aiProvidersRes.json();
  const reasoningModels = await reasoningModelsRes.json();

  return { aiProviders, reasoningModels };
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
        errors: responseData.message || 'Request failed',
      };
    }

    const scenario = await res.json();
    return redirect(`/community/scenarios`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function ScenarioNew({ loaderData }: Route.ComponentProps) {
  const { aiProviders, reasoningModels } = loaderData as { aiProviders: AiProvider[]; reasoningModels: any[] };
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [temperature, setTemperature] = useState(0.2);
  const [topP, setTopP] = useState(1);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.2);
  const [presencePenalty, setPresencePenalty] = useState(0.2);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preventFileOpen, setPreventFileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { avatarId } = useParams();

  const errors = fetcher.data?.errors;

  const handleClose = () => {
    navigate(`/community/scenarios`);
  };

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
          label: formatModelName(model.providerModelName),
          value: model.id,
          recommended: model.recommended,
        });
      });

      res.push(newOptionGroup);
    });
    return res;
  };

  const getReasoningModelOptions = (): OptionGroup[] => {
    let res: OptionGroup[] = [];
    if (!reasoningModels || reasoningModels.length === 0) return res;

    // Group reasoning models by provider
    const modelsByProvider: Record<string, any[]> = {};

    reasoningModels.forEach((model) => {
      const providerName = model.aiProvider?.name || 'Unknown Provider';
      if (!modelsByProvider[providerName]) {
        modelsByProvider[providerName] = [];
      }
      modelsByProvider[providerName].push(model);
    });

    // Convert grouped models to option groups
    Object.entries(modelsByProvider).forEach(([providerName, models]) => {
      const optionGroup: OptionGroup = {
        groupName: providerName,
        options: models.map((model) => ({
          label: formatModelName(model.providerModelName),
          value: model.id,
          recommended: model.recommended || false,
        })),
      };
      res.push(optionGroup);
    });

    return res;
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content
        className={cn(
          'overflow-y-auto flex flex-col scrollbar-medium',
          isExpanded ? 'max-w-none w-[90vw] h-screen' : 'max-h-[calc(100vh-104px)]'
        )}
      >
        <div className='flex items-center justify-between'>
          <Modal.Title>Create new scenario</Modal.Title>
          <button
            type='button'
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            title={isExpanded ? 'Collapse modal' : 'Expand modal'}
          >
            <Icons.expand />
          </button>
        </div>
        <Modal.Description className='sr-only'>Create new scenari</Modal.Description>
        <fetcher.Form method='post' encType='multipart/form-data' className='w-full flex flex-col mt-[18px] h-full'>
          <Modal.Body className={cn('flex gap-4 md:gap-6 flex-1', isExpanded ? 'flex-row' : 'flex-col')}>
            <ErrorsBox errors={errors} />

            {isExpanded && (
              <div className='flex-1 flex flex-col'>
                <Input.Root className='h-full'>
                  <Input.Label htmlFor='systemMessage'>System Message</Input.Label>
                  <Textarea.Textarea
                    id='systemMessage'
                    name='systemMessage'
                    className={cn(
                      'w-full border border-neutral-04 py-3.5 px-3 text-base-black h-full resize-none',
                      isExpanded ? 'flex-1 flex max-h-full' : ' min-h-[300px]'
                    )}
                    placeholder='System Message'
                  />
                  <p className='text-xs text-gray-500'>Provide a system message for this new scenario.</p>
                </Input.Root>
              </div>
            )}

            <div className={cn('flex flex-col gap-4 md:gap-6', isExpanded ? 'flex-1' : 'w-full')}>
              <div className={cn('flex gap-4 items-center', !isExpanded && 'justify-center')}>
                <div className={cn('flex flex-col items-center justify-center', isExpanded ? 'mb-6' : 'mb-10')}>
                  <div className='relative'>
                    <label
                      className='size-40 bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative'
                      onClick={handleLabelClick}
                    >
                      <input
                        ref={fileInputRef}
                        className='hidden'
                        type='file'
                        name='picture'
                        accept='image/*'
                        onChange={handleImageChange}
                      />
                      {selectedImage !== null ? (
                        <div className='size-full'>
                          <img src={selectedImage} alt='Scenario image' className='size-full object-cover rounded-lg' />
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
                            selectedImage && 'divide-x divide-neutral-04 gap-4'
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

                <div className={cn('grid gap-x-5 gap-y-3 w-full', isExpanded ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 hidden')}>
                  <Input.Root>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-1'>
                        <Input.Label htmlFor='temperature' className='text-neutral-01 text-body-sm'>
                          Temperature
                        </Input.Label>
                        <InformationBadge
                          className='!text-neutral-01 size-4'
                          tooltipText="Controls randomness in the model's output."
                          side={'top'}
                        />
                      </div>
                      <span className='text-base-black text-body-sm font-semibold'>{temperature}</span>
                    </div>
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
                  </Input.Root>
                  <Input.Root>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-1'>
                        <Input.Label htmlFor='topP' className='text-neutral-01 text-body-sm'>
                          TopP
                        </Input.Label>
                        <InformationBadge
                          className='!text-neutral-01 size-4'
                          tooltipText='Controls content diversity by selecting from the top probability mass.'
                          side={'top'}
                        />
                      </div>
                      <span className='text-base-black text-body-sm font-semibold'>{topP}</span>
                    </div>
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
                  </Input.Root>
                  <Input.Root>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-1'>
                        <Input.Label htmlFor='frequencyPenalty' className='text-neutral-01 text-body-sm'>
                          Frequency Penalty
                        </Input.Label>
                        <InformationBadge
                          className='!text-neutral-01 size-4'
                          tooltipText='Reduces repetition by penalizing similar phrases.'
                          side={'top'}
                        />
                      </div>
                      <span className='text-base-black text-body-sm font-semibold'>{frequencyPenalty}</span>
                    </div>
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
                  </Input.Root>
                  <Input.Root>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-1'>
                        <Input.Label htmlFor='presencePenalty' className='text-neutral-01 text-body-sm'>
                          Presence Penalty
                        </Input.Label>
                        <InformationBadge
                          className='!text-neutral-01 size-4'
                          tooltipText='Encourages creativity by penalizing new concepts.'
                          side={'top'}
                        />
                      </div>
                      <span className='text-base-black text-body-sm font-semibold'>{presencePenalty}</span>
                    </div>
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
                  </Input.Root>
                </div>
              </div>

              <Input.Root>
                <Input.Label htmlFor='name'>Name</Input.Label>
                <Input.Input id='name' name='name' type='text' placeholder='Movie Night' />
                <p className='text-xs text-gray-500'>Enter the name for the new scenario.</p>
              </Input.Root>

              {!isExpanded && (
                <Input.Root>
                  <Input.Label htmlFor='systemMessage'>System Message</Input.Label>
                  <Textarea.Textarea id='systemMessage' name='systemMessage' placeholder='System Message' rows={5} />
                  <p className='text-xs text-gray-500'>Provide a system message for this new scenario.</p>
                </Input.Root>
              )}

              <Input.Root>
                <Input.Label htmlFor='chatModelId'>Chat Model</Input.Label>
                <Select.Root
                  name='chatModelId'
                  defaultValue={
                    getOptions(true)
                      .flatMap((group) => group.options.find((option) => option.recommended)?.value || '')
                      .filter((value) => value !== '')[0]
                  }
                >
                  <Select.Trigger
                    id='chatModelId'
                    className='bg-neutral-05 data-[state=open]:bg-gradient-1 data-[state=open]:!outline data-[state=open]:!outline-neutral-04 transition-colors'
                  >
                    <Select.Value placeholder='Select a chat model' />
                  </Select.Trigger>
                  <Select.Content className='max-h-[250px] overflow-y-auto '>
                    {getOptions(true).map((group) => (
                      <Fragment key={group.groupName}>
                        <div className='px-2 py-1.5 text-sm font-semibold text-neutral-01'>{group.groupName}</div>
                        {group.options.map((option: any) => (
                          <Select.Item className='' key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Fragment>
                    ))}
                  </Select.Content>
                </Select.Root>
                <p className='text-xs text-gray-500'>Select the AI chat model for this new scenario.</p>
              </Input.Root>

              <Input.Root>
                <Input.Label htmlFor='embeddingModelId'>Embedding Model</Input.Label>
                <Select.Root
                  name='embeddingModelId'
                  defaultValue={
                    getOptions(false)
                      .flatMap((group) => group.options.find((option) => option.recommended)?.value || '')
                      .filter((value) => value !== '')[0]
                  }
                >
                  <Select.Trigger
                    id='embeddingModelId'
                    className='bg-neutral-05 data-[state=open]:bg-gradient-1 data-[state=open]:!outline data-[state=open]:!outline-neutral-04 transition-colors'
                  >
                    <Select.Value placeholder='Select an embedding model' />
                  </Select.Trigger>
                  <Select.Content className='max-h-[250px] overflow-y-auto'>
                    {getOptions(false).map((group) => (
                      <Fragment key={group.groupName}>
                        <div className='px-2 py-1.5 text-sm font-semibold text-neutral-01'>{group.groupName}</div>
                        {group.options.map((option: any) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Fragment>
                    ))}
                  </Select.Content>
                </Select.Root>
                <p className='text-xs text-gray-500'>Select the embedding model for similarity search.</p>
              </Input.Root>

              <Input.Root>
                <Input.Label htmlFor='reasoningModelId'>Reasoning Model</Input.Label>
                <Select.Root
                  name='reasoningModelId'
                  defaultValue={
                    getReasoningModelOptions()
                      .flatMap((group) => group.options.find((option) => option.recommended)?.value || '')
                      .filter((value) => value !== '')[0]
                  }
                >
                  <Select.Trigger
                    id='reasoningModelId'
                    className='bg-neutral-05 data-[state=open]:bg-gradient-1 data-[state=open]:!outline data-[state=open]:!outline-neutral-04 transition-colors'
                  >
                    <Select.Value placeholder='Select a reasoning model' />
                  </Select.Trigger>
                  <Select.Content className='max-h-[250px] overflow-y-auto'>
                    {getReasoningModelOptions().map((group) => (
                      <Fragment key={group.groupName}>
                        <div className='px-2 py-1.5 text-sm font-semibold text-neutral-01'>{group.groupName}</div>
                        {group.options.map((option: any) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Fragment>
                    ))}
                  </Select.Content>
                </Select.Root>
                <p className='text-xs text-gray-500'>Select the reasoning model for this scenario.</p>
              </Input.Root>

              <div className={cn('grid gap-x-5 gap-y-6 w-full', 'grid-cols-1 sm:grid-cols-2', isExpanded && 'hidden')}>
                <Input.Root>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1'>
                      <Input.Label htmlFor='temperature' className='text-neutral-01 text-body-sm'>
                        Temperature
                      </Input.Label>
                      <InformationBadge
                        className='!text-neutral-01 size-4'
                        tooltipText="Controls randomness in the model's output."
                        side={'top'}
                      />
                    </div>
                    <span className='text-base-black text-body-sm font-semibold'>{temperature}</span>
                  </div>
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
                </Input.Root>
                <Input.Root>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1'>
                      <Input.Label htmlFor='topP' className='text-neutral-01 text-body-sm'>
                        TopP
                      </Input.Label>
                      <InformationBadge
                        className='!text-neutral-01 size-4'
                        tooltipText='Controls content diversity by selecting from the top probability mass.'
                        side={'top'}
                      />
                    </div>
                    <span className='text-base-black text-body-sm font-semibold'>{topP}</span>
                  </div>
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
                </Input.Root>
                <Input.Root>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1'>
                      <Input.Label htmlFor='frequencyPenalty' className='text-neutral-01 text-body-sm'>
                        Frequency Penalty
                      </Input.Label>
                      <InformationBadge
                        className='!text-neutral-01 size-4'
                        tooltipText='Reduces repetition by penalizing similar phrases.'
                        side={'top'}
                      />
                    </div>
                    <span className='text-base-black text-body-sm font-semibold'>{frequencyPenalty}</span>
                  </div>
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
                </Input.Root>
                <Input.Root>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1'>
                      <Input.Label htmlFor='presencePenalty' className='text-neutral-01 text-body-sm'>
                        Presence Penalty
                      </Input.Label>
                      <InformationBadge
                        className='!text-neutral-01 size-4'
                        tooltipText='Encourages creativity by penalizing new concepts.'
                        side={'top'}
                      />
                    </div>
                    <span className='text-base-black text-body-sm font-semibold'>{presencePenalty}</span>
                  </div>
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
                </Input.Root>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className='pb-5'>
            <Modal.Close asChild>
              <Button.Root variant='secondary' aria-label='Close' className='w-full'>
                Cancel
              </Button.Root>
            </Modal.Close>
            <Button.Root type='submit' className='w-full'>
              Create Scenario
            </Button.Root>
          </Modal.Footer>
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
