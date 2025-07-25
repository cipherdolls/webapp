import { redirect, useFetcher, useNavigate, useRouteLoaderData } from 'react-router';
import { getPicture } from '~/utils/getPicture';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { AiProvider, AiProvidersPaginated, Scenario, Gender, Avatar, AvatarsPaginated, User } from '~/types';
import type { Route } from './+types/_main._general._id.scenarios.$scenariosId.edit';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import * as Select from '~/components/ui/input/select';
import * as Slider from '~/components/ui/slider';
import Multiselect from '~/components/ui/input/multiselect';
import { Fragment, useRef, useState } from 'react';
import { cn } from '~/utils/cn';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { formatModelName } from '~/utils/formatModelName';
import * as Modal from '~/components/ui/new-modal';
import { InformationBadge } from '~/components/ui/InformationBadge';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Scenario' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const scenarioId = params.scenariosId;

  const [scenarioRes, aiProvidersRes, avatarsRes, publicAvatarsRes] = await Promise.all([
    fetchWithAuth(`scenarios/${scenarioId}`),
    fetchWithAuth('ai-providers'),
    fetchWithAuth('avatars'),
    fetchWithAuth('avatars?published=true'),
  ]);

  const scenario = await scenarioRes.json();
  const { data }: AiProvidersPaginated = await aiProvidersRes.json();
  const aiProviders = data;

  const mineAvatars: AvatarsPaginated = await avatarsRes.json();
  const publicAvatars: AvatarsPaginated = await publicAvatarsRes.json();

  const allAvatars = [...mineAvatars.data, ...publicAvatars.data];
  const avatars = allAvatars.filter((avatar, index, self) => index === self.findIndex((a) => a.id === avatar.id));

  return { scenario, aiProviders, avatars };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const scenarioId = formData.get('scenarioId');

    // Handle boolean conversion for published field
    const publishedValue = formData.get('published');
    if (publishedValue === 'true' || publishedValue === 'false') {
      formData.set('published', publishedValue);
    }

    const res = await fetchWithAuth(`scenarios/${scenarioId}`, {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      const responseData = await res.json();
      return {
        errors: responseData.message || 'Request failed',
      };
    }

    const scenario: Scenario = await res.json();
    return redirect(`/scenarios/${scenario.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function ScenarioEdit({ loaderData }: Route.ComponentProps) {
  const { scenario, aiProviders, avatars } = loaderData as { scenario: Scenario; aiProviders: AiProvider[]; avatars: Avatar[] };
  const me = useRouteLoaderData('routes/_main') as User;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(scenario.picture ?? null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preventFileOpen, setPreventFileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  // const [scenarioType, setScenarioType] = useState<'Long' | 'Short'>('Long');
  const [publishedStatus, setPublishedStatus] = useState<'private' | 'public'>(scenario.published ? 'public' : 'private');
  const [userGender, setUserGender] = useState<Gender>(scenario.userGender || 'Male');
  const [avatarGender, setAvatarGender] = useState<Gender>(scenario.avatarGender || 'Female');

  const [temperature, setTemperature] = useState(scenario.temperature);
  const [topP, setTopP] = useState(scenario.topP);
  const [frequencyPenalty, setFrequencyPenalty] = useState(scenario.frequencyPenalty);
  const [presencePenalty, setPresencePenalty] = useState(scenario.presencePenalty);

  const [selectedAvatars, setSelectedAvatars] = useState<Avatar[]>(() => {
    if (!scenario.avatars) return [];

    const matched = scenario.avatars
      .map((scenarioAvatar) => avatars.find((avatar) => avatar.id === scenarioAvatar.id))
      .filter(Boolean) as Avatar[];

    return matched;
  });

  const errors = fetcher.data?.errors;

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

  const getOptions = (forModel: 'chatModel' | 'embeddingModel' | 'reasoningModel'): OptionGroup[] => {
    let res: OptionGroup[] = [];
    if (!aiProviders) return res;

    aiProviders.forEach((aiProvider) => {
      let newOptionGroup: OptionGroup = { groupName: aiProvider.name, options: [] };
      const modelsArr =
        (forModel === 'chatModel' && aiProvider.chatModels) ||
        (forModel === 'embeddingModel' && aiProvider.embeddingModels) ||
        (forModel === 'reasoningModel' && aiProvider.reasoningModels);

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
          <Modal.Title>Edit Scenario</Modal.Title>
          <button
            type='button'
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block'
            title={isExpanded ? 'Collapse modal' : 'Expand modal'}
          >
            <Icons.expand />
          </button>
        </div>
        <Modal.Description className='sr-only'>Edit scenario</Modal.Description>
        <fetcher.Form method='PATCH' encType='multipart/form-data' className='w-full flex flex-col mt-[18px] h-full'>
          <input type='hidden' name='temperature' value={temperature} />
          <input type='hidden' name='topP' value={topP} />
          <input type='hidden' name='frequencyPenalty' value={frequencyPenalty} />
          <input type='hidden' name='presencePenalty' value={presencePenalty} />
          <Modal.Body className={cn('flex gap-4 md:gap-6 flex-1', isExpanded ? 'flex-row' : 'flex-col')}>
            <ErrorsBox errors={errors} />
            <input type='hidden' name='scenarioId' value={scenario.id} />

            {isExpanded && (
              <div className='flex-1 flex flex-col pb-5'>
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
                    defaultValue={scenario.systemMessage}
                  />
                  <p className='text-xs text-gray-500'>Provide a system message for this scenario.</p>
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
                          <img
                            src={selectedImage.startsWith('blob:') ? selectedImage : getPicture(scenario, 'scenarios', false)}
                            srcSet={!selectedImage.startsWith('blob:') ? getPicture(scenario, 'scenarios', true) : undefined}
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
                    <Slider.Root id='topP' defaultValue={[topP]} min={0} max={1} step={0.1} onValueChange={(value) => setTopP(value[0])}>
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
                <Input.Input
                  className='text-base-black border border-neutral-04 py-3.5 px-3'
                  id='name'
                  name='name'
                  type='text'
                  defaultValue={scenario.name}
                  placeholder='Movie Night'
                />
                <p className='text-xs text-gray-500'>Enter the name for this scenario.</p>
              </Input.Root>

              {!isExpanded && (
                <Input.Root>
                  <Input.Label htmlFor='systemMessage'>System Message</Input.Label>
                  <Textarea.Textarea
                    id='systemMessage'
                    name='systemMessage'
                    className='w-full border border-neutral-04 py-3.5 px-3 text-base-black'
                    placeholder='System Message'
                    defaultValue={scenario.systemMessage}
                    rows={5}
                  />
                  <p className='text-xs text-gray-500'>Provide a system message for this scenario.</p>
                </Input.Root>
              )}

              <div className='grid gap-x-5 gap-y-3 w-full grid-cols-1 sm:grid-cols-2'>
                <Input.Root>
                  <Input.Label htmlFor='userGender'>User Gender</Input.Label>
                  <Select.Root name='userGender' defaultValue={userGender} onValueChange={(value) => setUserGender(value as Gender)}>
                    <Select.Trigger
                      id='userGender'
                      className='bg-neutral-05 data-[state=open]:bg-gradient-1 data-[state=open]:!outline data-[state=open]:!outline-neutral-04 transition-colors'
                    >
                      <Select.Value placeholder='Select user gender' />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value='Male'>Male</Select.Item>
                      <Select.Item value='Female'>Female</Select.Item>
                      <Select.Item value='Other'>Other</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <p className='text-xs text-gray-500'>Select the user gender for this scenario.</p>
                </Input.Root>

                <Input.Root>
                  <Input.Label htmlFor='avatarGender'>Avatar Gender</Input.Label>
                  <Select.Root name='avatarGender' defaultValue={avatarGender} onValueChange={(value) => setAvatarGender(value as Gender)}>
                    <Select.Trigger
                      id='avatarGender'
                      className='bg-neutral-05 data-[state=open]:bg-gradient-1 data-[state=open]:!outline data-[state=open]:!outline-neutral-04 transition-colors'
                    >
                      <Select.Value placeholder='Select avatar gender' />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value='Male'>Male</Select.Item>
                      <Select.Item value='Female'>Female</Select.Item>
                      <Select.Item value='Other'>Other</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <p className='text-xs text-gray-500'>Select the avatar gender for this scenario.</p>
                </Input.Root>
              </div>

              {/* <Input.Root>
                <Input.Label htmlFor='scenarioType'>Scenario Type</Input.Label>
                <div className='p-1 bg-neutral-05 grid grid-cols-2 rounded-xl'>
                  <button
                    type='button'
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      scenarioType === 'Long' ? 'bg-white' : 'bg-transparent'
                    )}
                    onClick={() => setScenarioType('Long')}
                  >
                    Long
                  </button>
                  <button
                    type='button'
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      scenarioType === 'Short' ? 'bg-white' : 'bg-transparent'
                    )}
                    onClick={() => setScenarioType('Short')}
                  >
                    Short
                  </button>
                </div>
                <input type='hidden' name='scenarioType' value={scenarioType} />
                <p className='text-xs text-gray-500'>Select type for new scenario.</p>
              </Input.Root> */}

              <Input.Root>
                <Input.Label htmlFor='chatModelId'>Chat Model</Input.Label>
                <Select.Root name='chatModelId' defaultValue={scenario.chatModel.id}>
                  <Select.Trigger
                    id='chatModelId'
                    className='bg-neutral-05 data-[state=open]:bg-gradient-1 data-[state=open]:!outline data-[state=open]:!outline-neutral-04 transition-colors'
                  >
                    <Select.Value placeholder='Select a chat model' />
                  </Select.Trigger>
                  <Select.Content className='max-h-[250px] overflow-y-auto '>
                    {getOptions('chatModel').map((group) => (
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
                <p className='text-xs text-gray-500'>Select the AI chat model for this scenario.</p>
              </Input.Root>

              {/* {scenarioType === 'Long' && (
                <>
                  <Input.Root>
                    <Input.Label htmlFor='embeddingModelId'>Embedding Model</Input.Label>
                    <Select.Root name='embeddingModelId' defaultValue={scenario.embeddingModel.id}>
                      <Select.Trigger
                        id='embeddingModelId'
                        className='bg-neutral-05 data-[state=open]:bg-gradient-1 data-[state=open]:!outline data-[state=open]:!outline-neutral-04 transition-colors'
                      >
                        <Select.Value placeholder='Select an embedding model' />
                      </Select.Trigger>
                      <Select.Content className='max-h-[250px] overflow-y-auto'>
                        {getOptions('embeddingModel').map((group) => (
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
                    <Select.Root name='reasoningModelId' defaultValue={scenario.reasoningModel?.id}>
                      <Select.Trigger
                        id='reasoningModelId'
                        className='bg-neutral-05 data-[state=open]:bg-gradient-1 data-[state=open]:!outline data-[state=open]:!outline-neutral-04 transition-colors'
                      >
                        <Select.Value placeholder='Select a reasoning model' />
                      </Select.Trigger>
                      <Select.Content className='max-h-[250px] overflow-y-auto'>
                        {getOptions('reasoningModel').map((group) => (
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
                </>
              )} */}

              <Input.Root>
                <Input.Label htmlFor='embeddingModelId'>Embedding Model</Input.Label>
                <Select.Root name='embeddingModelId' defaultValue={scenario.embeddingModel.id}>
                  <Select.Trigger
                    id='embeddingModelId'
                    className='bg-neutral-05 data-[state=open]:bg-gradient-1 data-[state=open]:!outline data-[state=open]:!outline-neutral-04 transition-colors'
                  >
                    <Select.Value placeholder='Select an embedding model' />
                  </Select.Trigger>
                  <Select.Content className='max-h-[250px] overflow-y-auto'>
                    {getOptions('embeddingModel').map((group) => (
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
                <Select.Root name='reasoningModelId' defaultValue={scenario.reasoningModel?.id}>
                  <Select.Trigger
                    id='reasoningModelId'
                    className='bg-neutral-05 data-[state=open]:bg-gradient-1 data-[state=open]:!outline data-[state=open]:!outline-neutral-04 transition-colors'
                  >
                    <Select.Value placeholder='Select a reasoning model' />
                  </Select.Trigger>
                  <Select.Content className='max-h-[250px] overflow-y-auto'>
                    {getOptions('reasoningModel').map((group) => (
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
                  <Slider.Root id='topP' defaultValue={[topP]} min={0} max={1} step={0.1} onValueChange={(value) => setTopP(value[0])}>
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

              <Input.Root>
                <Input.Label htmlFor='avatars'>Avatars</Input.Label>
                <Multiselect<Avatar>
                  userId={me.id}
                  options={avatars}
                  selectedOptions={selectedAvatars}
                  onChange={setSelectedAvatars}
                  placeholder='Select avatars for this scenario'
                />
                {Array.isArray(selectedAvatars) &&
                  selectedAvatars.length > 0 &&
                  selectedAvatars.map((avatar) => <input key={avatar.id} type='hidden' name='avatarIds[]' value={avatar.id} />)}
                <p className='text-xs text-gray-500'>Select avatars this scenario can be used with.</p>
              </Input.Root>

              <Input.Root>
                <Input.Label htmlFor='published'>Availability</Input.Label>
                <div className='p-1 bg-neutral-05 grid grid-cols-2 rounded-xl'>
                  <button
                    type='button'
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      publishedStatus === 'private' ? 'bg-white' : 'bg-transparent'
                    )}
                    onClick={() => setPublishedStatus('private')}
                  >
                    🔒 Private
                  </button>
                  <button
                    type='button'
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      publishedStatus === 'public' ? 'bg-white' : 'bg-transparent'
                    )}
                    onClick={() => setPublishedStatus('public')}
                  >
                    🌐 Public
                  </button>
                </div>
                <input type='hidden' name='published' value={publishedStatus === 'public' ? 'true' : 'false'} />
                <p className='text-xs text-gray-500'>
                  Anyone in the system can use public scenarios. Once published, you will no longer be able to edit or delete your scenario.
                </p>
              </Input.Root>
              <Modal.Footer className='pb-5'>
                <Modal.Close asChild>
                  <Button.Root variant='secondary' aria-label='Close' className='w-full'>
                    Cancel
                  </Button.Root>
                </Modal.Close>
                <Button.Root type='submit' className='w-full'>
                  Save
                </Button.Root>
              </Modal.Footer>
            </div>
          </Modal.Body>
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
