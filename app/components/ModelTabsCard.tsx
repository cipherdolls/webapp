import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Accordion from '@radix-ui/react-accordion';
import DetailCard from '~/components/ui/detail/detail-card';
import DetailRow from '~/components/ui/detail/detail-row';
import { Icons } from '~/components/ui/icons';
import Tooltip from '~/components/ui/tooltip';
import { formatModelName } from '~/utils/formatModelName';
import { formatNumberWithCommas } from '~/utils/formatNumberWithCommas';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import type { ChatModel, EmbeddingModel } from '~/types';

interface ModelTabsCardProps {
  chatModel?: ChatModel | null;
  embeddingModel?: EmbeddingModel | null;
  reasoningModel?: ChatModel | null;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

type TabValue = 'chat' | 'embedding' | 'reasoning';

const ModelTabsCard: React.FC<ModelTabsCardProps> = ({
  chatModel,
  embeddingModel,
  reasoningModel,
  temperature,
  topP,
  frequencyPenalty,
  presencePenalty,
}) => {
  const [activeTab, setActiveTab] = useState<TabValue>('chat');

  const tabs: Array<{ value: TabValue; label: string; model: ChatModel | EmbeddingModel | null | undefined; hasError: boolean }> = [
    {
      value: 'chat',
      label: 'Chat',
      model: chatModel,
      hasError: !!chatModel?.error,
    },
    {
      value: 'embedding',
      label: 'Embedding',
      model: embeddingModel,
      hasError: !!embeddingModel?.error,
    },
    {
      value: 'reasoning',
      label: 'Reasoning',
      model: reasoningModel,
      hasError: !!reasoningModel?.error,
    },
  ];

  return (
    <DetailCard isScenario title='AI Models'>
      <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <Tabs.List className='flex border-b border-neutral-04 mb-4 -mt-1'>
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              disabled={!tab.model}
              className='relative flex-1 py-2 text-body-sm font-medium transition-all duration-200
                data-[state=active]:text-base-black data-[state=inactive]:text-neutral-01
                border-b-2 data-[state=active]:border-base-black data-[state=inactive]:border-transparent
                data-[state=inactive]:hover:text-neutral-02
                disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-1.5'
            >
              {tab.label}
              {!tab.model && <span className='text-xs text-neutral-02'>(N/A)</span>}
              {tab.hasError && <Icons.warning className='size-3.5 text-specials-danger' />}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value='chat' className='focus:outline-none'>
          {chatModel ? (
            <div className='flex flex-col'>
              <div className='flex flex-col gap-4 pb-[18px]'>
                <DetailRow title='Name' value={formatModelName(chatModel.providerModelName || 'N/A')} />
                <DetailRow title='AI Provider' value={formatModelName(chatModel.aiProvider?.name || 'N/A')} />
                <DetailRow title='Context Window' value={`${formatNumberWithCommas(chatModel.contextWindow || 0)} token`} />
                <DetailRow title='Censored' value={chatModel.censored ? 'Yes' : 'No'} />
                <DetailRow title='Input Token Cost' value={`$${scientificNumConvert((chatModel.dollarPerInputToken || 0) * 1000000)}`} />
                <DetailRow title='Output Token Cost' value={`$${scientificNumConvert((chatModel.dollarPerOutputToken || 0) * 1000000)}`} />

                {chatModel.error && (
                  <div className='flex gap-1 overflow-hidden'>
                    <DetailRow title='Error' value={''} />
                    <Tooltip
                      side={'top'}
                      trigger={<Icons.warning className='size-4 text-specials-danger' />}
                      content={chatModel.error}
                      popoverClassName='max-w-[320px]'
                      className={'max-w-[310px]'}
                    />
                  </div>
                )}
              </div>

              <Accordion.Root type='single' collapsible className='w-full'>
                <Accordion.Item value='parameters'>
                  <Accordion.Trigger className='flex items-center justify-center w-full py-2 text-sm font-medium text-neutral-01 hover:text-base-black transition-colors group'>
                    <span className='group-data-[state=closed]:block group-data-[state=open]:hidden'>Show Advanced Parameters</span>
                    <span className='group-data-[state=closed]:hidden group-data-[state=open]:block'>Hide Advanced Parameters</span>
                    <Icons.chevronDown className='ml-2 h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180' />
                  </Accordion.Trigger>
                  <Accordion.Content className='overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
                    <div className='flex flex-col gap-4 pt-[18px]'>
                      <DetailRow title='Temperature' value={temperature} />
                      <DetailRow title='TopP' value={topP} />
                      <DetailRow title='Frequency Penalty' value={frequencyPenalty} />
                      <DetailRow title='Presence Penalty' value={presencePenalty} />
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            </div>
          ) : (
            <p className='text-neutral-01 text-body-sm'>No chat model configured</p>
          )}
        </Tabs.Content>

        <Tabs.Content value='embedding' className='focus:outline-none'>
          {embeddingModel ? (
            <div className='flex flex-col gap-4'>
              <DetailRow title='Name' value={formatModelName(embeddingModel.providerModelName || 'N/A')} />
              <DetailRow title='AI Provider' value={formatModelName(embeddingModel.aiProvider?.name || 'N/A')} />
              <DetailRow title='Input Token Cost' value={`$${scientificNumConvert((embeddingModel.dollarPerInputToken || 0) * 1000000)}`} />
              <DetailRow
                title='Output Token Cost'
                value={`$${scientificNumConvert((embeddingModel.dollarPerOutputToken || 0) * 1000000)}`}
              />

              {embeddingModel.error && (
                <div className='flex justify-between w-full gap-1 overflow-hidden'>
                  <DetailRow title='Error' value={''} />
                  <Tooltip
                    side={'top'}
                    trigger={<Icons.warning className='size-4 text-specials-danger' />}
                    content={embeddingModel.error}
                    popoverClassName='max-w-[320px]'
                    className={'max-w-[310px]'}
                  />
                </div>
              )}
            </div>
          ) : (
            <p className='text-neutral-01 text-body-sm'>No embedding model configured</p>
          )}
        </Tabs.Content>

        <Tabs.Content value='reasoning' className='focus:outline-none'>
          {reasoningModel ? (
            <div className='flex flex-col gap-4'>
              <DetailRow title='Name' value={formatModelName(reasoningModel.providerModelName || 'N/A')} />
              <DetailRow title='AI Provider' value={formatModelName(reasoningModel.aiProvider?.name || 'N/A')} />
              <DetailRow title='Input Token Cost' value={`$${scientificNumConvert((reasoningModel.dollarPerInputToken || 0) * 1000000)}`} />
              <DetailRow
                title='Output Token Cost'
                value={`$${scientificNumConvert((reasoningModel.dollarPerOutputToken || 0) * 1000000)}`}
              />

              {reasoningModel.error && (
                <div className='flex gap-1 overflow-hidden'>
                  <DetailRow title='Error' value={''} />
                  <Tooltip
                    side={'top'}
                    trigger={<Icons.warning className='size-4 text-specials-danger' />}
                    content={reasoningModel.error}
                    popoverClassName='max-w-[320px]'
                    className={'max-w-[310px]'}
                  />
                </div>
              )}
            </div>
          ) : (
            <p className='text-neutral-01 text-body-sm'>No reasoning model configured</p>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </DetailCard>
  );
};

export default ModelTabsCard;
