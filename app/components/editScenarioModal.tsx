import { useNavigate } from 'react-router';
import type { AiProvider, Scenario } from '~/types';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import * as Select from '~/components/ui/input/select';
import * as Slider from '~/components/ui/slider';
import { Fragment, useState } from 'react';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { formatModelName } from '~/utils/formatModelName';
import * as Modal from '~/components/ui/new-modal';
import { InformationBadge } from '~/components/ui/InformationBadge';
import { cn } from '~/utils/cn';
import { useUpdateScenario } from '~/hooks/queries/scenarioMutations';

interface EditScenarioModalProps {
  scenario: Scenario;
  aiProviders: AiProvider[]
  refetch: () => void;
}

const EditScenarioModal = ({ scenario, aiProviders, refetch }: EditScenarioModalProps) => {

  const { mutate: updateScenario, error: updateScenarioError  } = useUpdateScenario();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [temperature, setTemperature] = useState(scenario.temperature);
  const [topP, setTopP] = useState(scenario.topP);
  const [frequencyPenalty, setFrequencyPenalty] = useState(scenario.frequencyPenalty);
  const [presencePenalty, setPresencePenalty] = useState(scenario.presencePenalty);



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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, any> = Object.fromEntries(formData.entries());
    setIsOpen(false)
    updateScenario({ scenarioId: scenario.id, data },
      {
        onSuccess: () => {
          refetch()
        },
      }
    );
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>
        <button className='opacity-50 transition-opacity hover:opacity-80'>
          <Icons.pen />
        </button>
      </Modal.Trigger>

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
        <form className='w-full flex flex-col mt-[18px] h-full' onSubmit={handleSubmit}>
          <input type='hidden' name='name' value={scenario.name} />
          {scenario.embeddingModel && <input type='hidden' name='embeddingModelId' value={scenario.embeddingModel.id} />}
          {scenario.reasoningModel && <input type='hidden' name='reasoningModelId' value={scenario.reasoningModel.id} />}

          <input type='hidden' name='temperature' value={temperature} />
          <input type='hidden' name='topP' value={topP} />
          <input type='hidden' name='frequencyPenalty' value={frequencyPenalty} />
          <input type='hidden' name='presencePenalty' value={presencePenalty} />

          <Modal.Body className={cn('flex gap-4 md:gap-6 flex-1', isExpanded ? 'flex-row' : 'flex-col')}>
            <ErrorsBox errors={updateScenarioError} />
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
              <div className={cn('flex flex-col', isExpanded && 'h-full justify-between')}>
                <div className='flex flex-col gap-4 w-full md:gap-6'>
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

                  <div className={cn('grid gap-x-5 gap-y-6 w-full grid-cols-1', isExpanded ? 'grid-cols-1' : 'grid-cols-2')}>
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
              </div>
            </div>
          </Modal.Body>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

export default EditScenarioModal;
