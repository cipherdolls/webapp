import { useRouteLoaderData } from 'react-router';
import { getPicture } from '~/utils/getPicture';
import type { Avatar, Gender, Scenario, User } from '~/types';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import * as Select from '~/components/ui/input/select';
import * as Slider from '~/components/ui/slider';
import Multiselect from '~/components/ui/input/multiselect';
import { Fragment, useMemo, useRef, useState } from 'react';
import { cn } from '~/utils/cn';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { formatModelName } from '~/utils/formatModelName';
import * as Modal from '~/components/ui/new-modal';
import { InformationBadge } from '~/components/ui/InformationBadge';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { useAiProviders } from '~/hooks/queries/aiProviderQueries';

interface ScenarioFormModalProps {
  scenario?: Scenario;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isLoading?: boolean;
  errors?: Error | null;
}

interface Option {
  label: string;
  value: string;
  recommended: boolean;
}

interface OptionGroup {
  groupName: string;
  options: Option[];
}

// Default scenario params for new scenarios
const defaultScenarioData = {
  userGender: 'Male' as Gender,
  avatarGender: 'Female' as Gender,
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

const ScenarioFormModal = ({ scenario, onClose, onSubmit, errors, isLoading }: ScenarioFormModalProps) => {
  const { data: avatarsData } = useAvatars({ mine: 'true', published: 'true', limit: '100' });
  const { data: aiProvidersData } = useAiProviders();

  const avatars = useMemo(() => avatarsData?.data || [], [avatarsData]);
  const aiProviders = useMemo(() => aiProvidersData?.data || [], [aiProvidersData]);

  const me = useRouteLoaderData('routes/_main') as User;
  const [selectedImage, setSelectedImage] = useState<string | null>(scenario?.picture ?? null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preventFileOpen, setPreventFileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [scenarioData, setScenarioData] = useState({
    picture: scenario?.picture ?? null,
    published: scenario?.published ?? false,
    userGender: scenario?.userGender ?? defaultScenarioData.userGender,
    avatarGender: scenario?.avatarGender ?? defaultScenarioData.avatarGender,
    temperature: scenario?.temperature ?? defaultScenarioData.temperature,
    topP: scenario?.topP ?? defaultScenarioData.topP,
    frequencyPenalty: scenario?.frequencyPenalty ?? defaultScenarioData.frequencyPenalty,
    presencePenalty: scenario?.presencePenalty ?? defaultScenarioData.presencePenalty,
    name: scenario?.name ?? '',
    systemMessage: scenario?.systemMessage ?? '',
    chatModelId: scenario?.chatModel?.id ?? '',
    embeddingModelId: scenario?.embeddingModel?.id ?? '',
    reasoningModelId: scenario?.reasoningModel?.id ?? '',
    refreshIntroduction: false,
    avatars: scenario?.avatars
      ? (scenario.avatars.map((scenarioAvatar) => avatars.find((avatar) => avatar.id === scenarioAvatar.id)).filter(Boolean) as Avatar[])
      : [],
  });
  const isNew = !scenario;

  const updateScenarioData = (field: keyof typeof scenarioData, value: any) => {
    setScenarioData((prev) => ({ ...prev, [field]: value }));
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

  const handleClose = () => {
    onClose?.();
  };

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
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
          'animate-modal-show overflow-y-auto flex flex-col scrollbar-medium',
          isExpanded ? 'max-w-none w-[90vw] h-screen' : 'max-h-[calc(100vh-104px)]'
        )}
      >
        <div className='flex items-center justify-between pb-4'>
          <Modal.Title>{isNew ? 'Create New Scenario' : 'Edit Scenario'}</Modal.Title>
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
        <form encType='multipart/form-data' className='flex flex-col flex-1 overflow-hidden -mx-8 px-8' onSubmit={handleSubmit}>
          <input type='hidden' name='temperature' value={scenarioData.temperature} />
          <input type='hidden' name='topP' value={scenarioData.topP} />
          <input type='hidden' name='frequencyPenalty' value={scenarioData.frequencyPenalty} />
          <input type='hidden' name='presencePenalty' value={scenarioData.presencePenalty} />
          {scenarioData.refreshIntroduction && <input type='hidden' name='action' value='RefreshIntroduction' />}
          <Modal.Body
            className={cn(
              'flex gap-4 md:gap-6 flex-1 overflow-auto scrollbar-medium -mx-8 px-8 [scrollbar-gutter:stable]',
              isExpanded ? 'flex-row' : 'flex-col'
            )}
          >
            {scenario?.id && <input type='hidden' name='scenarioId' value={scenario.id} />}

            {isExpanded && (
              <div className='flex-1 flex flex-col pb-0.5'>
                <Input.Root className='h-full'>
                  <div className='flex items-center justify-between gap-3'>
                    <Input.Label htmlFor='systemMessage'>System Message</Input.Label>
                    {!isNew && (
                      <div className='flex items-center gap-2'>
                        <input
                          type='checkbox'
                          id='refreshIntroduction'
                          checked={scenarioData.refreshIntroduction}
                          onChange={(e) => updateScenarioData('refreshIntroduction', e.target.checked)}
                          className='h-4 w-4'
                        />
                        <label htmlFor='refreshIntroduction' className='text-xs text-neutral-01 cursor-pointer'>
                          Refresh introduction
                        </label>
                      </div>
                    )}
                  </div>
                  <Textarea.Textarea
                    id='systemMessage'
                    name='systemMessage'
                    className={cn(
                      'w-full border border-neutral-04 py-3.5 px-3 text-base-black h-full resize-none',
                      isExpanded ? 'flex-1 flex max-h-full' : ' min-h-[300px]'
                    )}
                    placeholder='System Message'
                    defaultValue={scenario?.systemMessage}
                  />
                  <p className='text-xs text-gray-500'>Provide a system message for this scenario.</p>
                </Input.Root>
              </div>
            )}

            <div
              className={cn(
                'flex flex-col gap-4 md:gap-6  ',
                isExpanded ? 'flex-1 pb-5 h-full -mx-4 px-4 overflow-auto scrollbar-medium' : 'w-full'
              )}
            >
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
                            alt={scenario?.name ? scenarioData.name : 'Scenario image'}
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
                        <div className='flex items-center justify-center bg-base-white shadow-bottom-level-2 rounded-full overflow-hidden'>
                          {selectedImage !== null && (
                            <button
                              type='button'
                              className=' py-2 px-5 relative z-10 duration-300 transition-opacity hover:opacity-60'
                              onClick={handleTrashClick}
                            >
                              <Icons.trash className='text-black' />
                            </button>
                          )}
                          {(selectedImage || scenario?.picture) && <div className='h-6 w-px bg-neutral-04' />}
                          <button
                            type='button'
                            className='py-2 px-5 relative z-10 duration-300 transition-opacity hover:opacity-60'
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Icons.fileUpload />
                          </button>
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
                      <span className='text-base-black text-body-sm font-semibold'>{scenarioData.temperature}</span>
                    </div>
                    <Slider.Root
                      id='temperature'
                      defaultValue={[scenarioData.temperature]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => updateScenarioData('temperature', value[0])}
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
                      <span className='text-base-black text-body-sm font-semibold'>{scenarioData.topP}</span>
                    </div>
                    <Slider.Root
                      id='topP'
                      defaultValue={[scenarioData.topP]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => updateScenarioData('topP', value[0])}
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
                      <span className='text-base-black text-body-sm font-semibold'>{scenarioData.frequencyPenalty}</span>
                    </div>
                    <Slider.Root
                      id='frequencyPenalty'
                      defaultValue={[scenarioData.frequencyPenalty]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => updateScenarioData('frequencyPenalty', value[0])}
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
                      <span className='text-base-black text-body-sm font-semibold'>{scenarioData.presencePenalty}</span>
                    </div>
                    <Slider.Root
                      id='presencePenalty'
                      defaultValue={[scenarioData.presencePenalty]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => updateScenarioData('presencePenalty', value[0])}
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
                  defaultValue={scenario?.name}
                  placeholder='Movie Night'
                />
                <p className='text-xs text-gray-500'>Enter the name for this scenario.</p>
              </Input.Root>

              {!isExpanded && (
                <Input.Root>
                  <div className='flex items-center justify-between gap-3'>
                    <Input.Label htmlFor='systemMessage'>System Message</Input.Label>
                    {!isNew && (
                      <div className='flex items-center gap-2'>
                        <input
                          type='checkbox'
                          id='refreshIntroduction'
                          checked={scenarioData.refreshIntroduction}
                          onChange={(e) => updateScenarioData('refreshIntroduction', e.target.checked)}
                          className='h-4 w-4'
                        />
                        <label htmlFor='refreshIntroduction' className='text-xs text-neutral-01 cursor-pointer'>
                          Refresh introduction
                        </label>
                      </div>
                    )}
                  </div>
                  <Textarea.Textarea
                    id='systemMessage'
                    name='systemMessage'
                    className='w-full border border-neutral-04 py-3.5 px-3 text-base-black'
                    placeholder='System Message'
                    defaultValue={scenario?.systemMessage}
                    rows={5}
                  />
                  <p className='text-xs text-gray-500'>Provide a system message for this scenario.</p>
                </Input.Root>
              )}

              <div className='grid gap-x-5 gap-y-3 w-full grid-cols-1 sm:grid-cols-2'>
                <Input.Root>
                  <Input.Label htmlFor='userGender'>User Gender</Input.Label>
                  <Select.Root
                    name='userGender'
                    defaultValue={scenarioData.userGender}
                    onValueChange={(value) => updateScenarioData('userGender', value as Gender)}
                  >
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
                  <Select.Root
                    name='avatarGender'
                    defaultValue={scenarioData.avatarGender}
                    onValueChange={(value) => updateScenarioData('avatarGender', value as Gender)}
                  >
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
                <Select.Root name='chatModelId' defaultValue={scenario?.chatModel.id}>
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
                <Select.Root name='embeddingModelId' defaultValue={scenario?.embeddingModel.id}>
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
                <Select.Root name='reasoningModelId' defaultValue={scenario?.reasoningModel?.id}>
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
                    <span className='text-base-black text-body-sm font-semibold'>{scenarioData.temperature}</span>
                  </div>
                  <Slider.Root
                    id='temperature'
                    defaultValue={[scenarioData.temperature]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => updateScenarioData('temperature', value[0])}
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
                    <span className='text-base-black text-body-sm font-semibold'>{scenarioData.topP}</span>
                  </div>
                  <Slider.Root
                    id='topP'
                    defaultValue={[scenarioData.topP]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => updateScenarioData('topP', value[0])}
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
                    <span className='text-base-black text-body-sm font-semibold'>{scenarioData.frequencyPenalty}</span>
                  </div>
                  <Slider.Root
                    id='frequencyPenalty'
                    defaultValue={[scenarioData.frequencyPenalty]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => updateScenarioData('frequencyPenalty', value[0])}
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
                    <span className='text-base-black text-body-sm font-semibold'>{scenarioData.presencePenalty}</span>
                  </div>
                  <Slider.Root
                    id='presencePenalty'
                    defaultValue={[scenarioData.presencePenalty]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => updateScenarioData('presencePenalty', value[0])}
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
                  selectedOptions={scenarioData.avatars}
                  onChange={(value) => updateScenarioData('avatars', value)}
                  placeholder='Select avatars for this scenario'
                  defaultValue={Array.isArray(scenario?.avatars) ? scenario?.avatars.map((avatar) => avatar.id) : []}
                />
                {Array.isArray(scenarioData.avatars) &&
                  scenarioData.avatars.length > 0 &&
                  scenarioData.avatars.map((avatar) => <input key={avatar.id} type='hidden' name='avatarIds[]' value={avatar.id} />)}
                <p className='text-xs text-gray-500'>Select avatars this scenario can be used with.</p>
              </Input.Root>

              <Input.Root>
                <Input.Label htmlFor='published'>Availability</Input.Label>
                <div
                  className={cn('p-1 bg-neutral-05 grid grid-cols-2 rounded-xl', scenario?.published && 'opacity-50 cursor-not-allowed')}
                >
                  <button
                    type='button'
                    disabled={scenario?.published}
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors bg-transparent',
                      !scenarioData.published && 'bg-white',
                      scenario?.published && 'cursor-not-allowed'
                    )}
                    onClick={() => !scenario?.published && updateScenarioData('published', false)}
                  >
                    🔒 Private
                  </button>
                  <button
                    type='button'
                    disabled={scenario?.published}
                    className={cn(
                      'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                      scenarioData.published && 'bg-white',
                      scenario?.published && 'cursor-not-allowed'
                    )}
                    onClick={() => !scenario?.published && updateScenarioData('published', true)}
                  >
                    🌐 Public
                  </button>
                </div>
                <input type='hidden' name='published' value={scenarioData.published ? 'true' : 'false'} />
                <p className='text-xs text-gray-500'>
                  {scenario?.published
                    ? 'If scenario is published it cannot be unpublished or deleted.'
                    : 'Anyone in the system can use public scenarios. Once published, you will no longer be able to edit or delete your scenario.'}
                </p>
              </Input.Root>
            </div>
          </Modal.Body>
          <ErrorsBox errors={errors} className='mt-3' />
          <Modal.Footer className={cn('flex-shrink-0 pt-7')}>
            <Modal.Close asChild>
              <Button.Root variant='secondary' aria-label='Close' className='w-full'>
                Cancel
              </Button.Root>
            </Modal.Close>
            <Button.Root type='submit' className='w-full' disabled={isLoading}>
              {isNew ? 'Create Scenario' : 'Save'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

export default ScenarioFormModal;
