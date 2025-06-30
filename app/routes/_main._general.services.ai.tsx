import { Outlet } from 'react-router';
import React, { useEffect, useState } from 'react';
import type { AiProvider, AiProvidersPaginated, ChatModel, EmbeddingModel } from '~/types';
import type { Route } from './+types/_main._general.services.ai';
import type { TTableColumn } from '~/components/Table';
import Table from '~/components/Table';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { DataCard } from '~/components/DataCard';
import { Fragment } from 'react/jsx-runtime';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { ViewButton } from '~/components/preferencesViewButton';
import { getPicture } from '~/utils/getPicture';
import { RecommendedBadge } from '~/components/ui/RecommendedBadge';
import { InformationBadge } from '~/components/ui/InformationBadge';
import { formatModelName } from '~/utils/formatModelName';
import Tooltip from '~/components/ui/tooltip';
import { Icons } from '~/components/ui/icons';

function AiProviderSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-10 pb-5'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='flex flex-col gap-4'>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full max-w-[200px] animate-pulse'></div>
          <div className='flex flex-col gap-3'>
            <div className='rounded-[10px] h-[110px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[110px] bg-gradient-1 w-full animate-pulse'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'AI Providers' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const res = await fetchWithAuth(`ai-providers`);
  return await res.json();
}

export default function AiProvidersIndex({ loaderData }: Route.ComponentProps) {
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  useEffect(() => {
    if (loaderData) {
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [loaderData]);

  if (!hasInitiallyLoaded || !loaderData) {
    return (
      <>
        <AiProviderSkeleton />
        <Outlet />
      </>
    );
  }

  const aiProvidersPaginated: AiProvidersPaginated = loaderData;
  const aiProviders: AiProvider[] = aiProvidersPaginated.data;

  const chatModelColumns: Array<TTableColumn<ChatModel>> = [
    {
      id: 'providerModelName',
      label: 'Chat model',
      render: (data) => (
        <span className='font-semibold text-body-md flex items-center gap-2'>
          {data.error && (
            <Tooltip
              side={'top'}
              trigger={<Icons.warning className='size-4 text-specials-danger' />}
              content={data.error}
              popoverClassName='max-w-[350px]'
            />
          )}
          {formatModelName(data.providerModelName)}
          <RecommendedBadge recommended={data.recommended} tooltipText='Recommended' />
        </span>
      ),
      align: 'left',
      className: 'min-w-[220px] max-w-[280px]',
    },
    {
      id: 'aiProviderId',
      label: '',
      render: (data) => <span className='text-body-sm text-neutral-01'>{data.info}</span>,
      align: 'left',
    },
    {
      id: 'dollarPerInputToken',
      label: 'Input',
      render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerInputToken * 1000000)}</span>,
      align: 'right',
      width: '104px',
      tooltipText: 'The cost of processing one million tokens that you send to the model',
    },
    {
      id: 'dollarPerOutputToken',
      label: 'Output',
      render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerOutputToken * 1000000)}</span>,
      align: 'right',
      width: '104px',
      tooltipText: 'Cost 1 unit of the token you received at the same rate',
    },
    {
      id: 'id',
      label: '',
      render: (data) => (
        <ViewButton
          popoverItems={[
            { text: 'Edit', href: `/services/ai/chat-models/${data.id}/edit` },
            { text: 'Delete', href: `/services/ai/chat-models/${data.id}/delete`, isDelete: true },
          ]}
          className='flex items-center justify-center'
          isDataCard={true}
        />
      ),
      width: '44px',
      align: 'right',
    },
  ];

  const embeddingModelColumns: Array<TTableColumn<EmbeddingModel>> = [
    {
      id: 'providerModelName',
      label: 'Embedding model',
      render: (data) => (
        <span className='font-semibold text-body-md flex items-center gap-2'>
          {data.error && (
            <Tooltip
              side={'top'}
              trigger={<Icons.warning className='size-4 text-specials-danger' />}
              content={data.error}
              className='max-w-[350px]'
            />
          )}
          {formatModelName(data.providerModelName)}
          <RecommendedBadge recommended={data.recommended} tooltipText='Recommended' />
        </span>
      ),
      align: 'left',
      className: 'min-w-[220px] max-w-[280px]',
    },
    {
      id: 'aiProviderId',
      label: '',
      render: (data) => <span className='text-body-sm text-neutral-01'>{data.info}</span>,
      align: 'left',
    },
    {
      id: 'dollarPerInputToken',
      label: 'Input',
      render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerInputToken * 1000000)}</span>,
      align: 'right',
      width: '104px',
      tooltipText: 'The cost of processing one million tokens that you send to the model',
    },
    {
      id: 'dollarPerOutputToken',
      label: 'Output',
      render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerOutputToken * 1000000)}</span>,
      align: 'right',
      width: '104px',
      tooltipText: 'Cost 1 unit of the token you received at the same rate',
    },
    {
      id: 'id',
      label: '',
      render: (data) => (
        <ViewButton
          popoverItems={[
            { text: 'Edit', href: `/services/ai/embedding-models/${data.id}/edit` },
            { text: 'Delete', href: `/services/ai/embedding-models/${data.id}/delete`, isDelete: true },
          ]}
          className='flex items-center justify-center'
          isDataCard={true}
        />
      ),
      width: '44px',
      align: 'right',
    },
  ];

  const reasoningModelColumns: Array<TTableColumn<ChatModel>> = [
    {
      id: 'providerModelName',
      label: 'Reasoning model',
      render: (data) => (
        <span className='font-semibold text-body-md flex items-center gap-2'>
          {data.error && (
            <Tooltip
              side={'top'}
              trigger={<Icons.warning className='size-4 text-specials-danger' />}
              content={data.error}
              className='max-w-[350px]'
            />
          )}
          {formatModelName(data.providerModelName)}
          <RecommendedBadge recommended={data.recommended} tooltipText='Recommended' />
        </span>
      ),
      align: 'left',
      className: 'min-w-[220px] max-w-[280px]',
    },
    {
      id: 'aiProviderId',
      label: '',
      render: (data) => <span className='text-body-sm text-neutral-01'>{data.info}</span>,
      align: 'left',
    },
    {
      id: 'dollarPerInputToken',
      label: 'Input',
      render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerInputToken * 1000000)}</span>,
      align: 'right',
      width: '104px',
      tooltipText: 'The cost of processing one million tokens that you send to the model',
    },
    {
      id: 'dollarPerOutputToken',
      label: 'Output',
      render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerOutputToken * 1000000)}</span>,
      align: 'right',
      width: '104px',
      tooltipText: 'Cost 1 unit of the token you received at the same rate',
    },
    {
      id: 'id',
      label: '',
      render: (data) => (
        <ViewButton
          popoverItems={[
            { text: 'Edit', href: `/services/ai/reasoning-models/${data.id}/edit` },
            { text: 'Delete', href: `/services/ai/reasoning-models/${data.id}/delete`, isDelete: true },
          ]}
          className='flex items-center justify-center'
          isDataCard={true}
        />
      ),
      width: '44px',
      align: 'right',
    },
  ];
  console.log(aiProviders);
  return (
    <>
      <div className='flex flex-col gap-10 pb-5'>
        {aiProviders.map((aiProvider) => {
          return (
            <div key={aiProvider.id} className='flex flex-col gap-5'>
              <DataCard.Root>
                <DataCard.Label
                  className='text-2xl font-semibold flex items-center gap-2'
                  extra={
                    <ViewButton
                      popoverItems={[
                        { text: 'Edit AI Provider', href: `/services/ai/ai-providers/${aiProvider.id}/edit` },
                        {
                          text: 'Add Chat Model',
                          href: `/services/ai/chat-models/new?id=${aiProvider.id}&name=${aiProvider.name}`,
                        },
                        {
                          text: 'Add Embedding Model',
                          href: `/services/ai/embedding-models/new?id=${aiProvider.id}&name=${aiProvider.name}`,
                        },
                        {
                          text: 'Add Reasoning Model',
                          href: `/services/ai/reasoning-models/new?id=${aiProvider.id}&name=${aiProvider.name}`,
                        },
                        {
                          text: 'Delete',
                          href: `/services/ai/providers/delete?id=${aiProvider.id}&name=${aiProvider.name}`,
                          isDelete: true,
                        },
                      ]}
                    />
                  }
                >
                  <div className='size-6'>
                    <img
                      src={getPicture(aiProvider, 'ai-providers', false)}
                      srcSet={getPicture(aiProvider, 'ai-providers', true)}
                      alt={aiProvider.name}
                      className='size-full object-cover rounded-lg'
                    />
                  </div>
                  <div className='flex items-center gap-1'>
                    {aiProvider.name}
                    <InformationBadge
                      tooltipText='High-speed AI for real-time apps and chatbots'
                      side={{
                        default: 'top',
                        lg: 'right',
                      }}
                    />
                  </div>
                </DataCard.Label>

                {/* CHAT MODELS WRAPPER */}
                <div className='bg-gradient-1 rounded-xl md:bg-none'>
                  {aiProvider.chatModels.length > 0 && (
                    <>
                      <div className='flex items-center justify-between p-3 md:hidden'>
                        <span className='text-xs text-neutral-01 font-semibold'>Chat model</span>
                        <InformationBadge
                          tooltipText='Chat model'
                          side={{
                            default: 'top',
                            lg: 'right',
                          }}
                        />
                      </div>

                      <DataCard.Wrapper>
                        {/* DESKTOP TABLE */}
                        <div className='md:block hidden'>
                          <Table
                            columns={chatModelColumns}
                            data={aiProvider.chatModels}
                            getRowUrl={(chatModel) => `/chat-models/${chatModel.id}`}
                          />
                        </div>

                        {/* MOBILE CARD */}
                        <div className='block md:hidden'>
                          {aiProvider.chatModels.map((chatModel, index) => {
                            return (
                              <Fragment key={chatModel.id}>
                                <DataCard.Item collapsible href={`/chat-models/${chatModel.id}`}>
                                  <DataCard.ItemLabel>
                                    <span className='flex items-center gap-2'>
                                      {chatModel.providerModelName}
                                      <RecommendedBadge recommended={chatModel.recommended} tooltipText='Recommended' />
                                    </span>
                                  </DataCard.ItemLabel>
                                  <DataCard.ItemCollapsibleContent>
                                    <DataCard.ItemDataGrid
                                      data={[
                                        {
                                          label: 'Output',
                                          value: <>{scientificNumConvert(chatModel.dollarPerInputToken)}</>,
                                        },
                                        {
                                          label: 'Average Time Taken',
                                          value: '1153 ms',
                                        },
                                      ]}
                                      variant='secondary'
                                    />
                                  </DataCard.ItemCollapsibleContent>
                                  <DataCard.ItemDataGrid
                                    data={[
                                      {
                                        label: '$/Input',
                                        value: <>${scientificNumConvert(chatModel.dollarPerInputToken)}</>,
                                      },
                                      {
                                        label: '$/Output',
                                        value: <>${scientificNumConvert(chatModel.dollarPerOutputToken)}</>,
                                      },
                                    ]}
                                  />
                                </DataCard.Item>
                                {aiProvider.chatModels.length - 1 !== index && <DataCard.Divider />}
                              </Fragment>
                            );
                          })}
                        </div>
                      </DataCard.Wrapper>
                    </>
                  )}

                  {/* EMBEDDING MODELS WRAPPER */}
                  {aiProvider.embeddingModels.length > 0 && (
                    <>
                      <div className='flex items-center justify-between px-3 pt-3 md:hidden'>
                        <span className='text-xs text-neutral-01 font-semibold'>Embedding model</span>
                        <Tooltip
                          side='top'
                          trigger={<Icons.info className='text-neutral-02 inline-block size-4' />}
                          content={'Embedding model'}
                        />
                      </div>

                      <DataCard.Wrapper className='mt-3'>
                        {/* DESKTOP TABLE */}
                        <div className='md:block hidden'>
                          <Table
                            columns={embeddingModelColumns}
                            data={aiProvider.embeddingModels}
                            getRowUrl={(embeddingModel) => `/embedding-models/${embeddingModel.id}`}
                          />
                        </div>
                        {/* MOBILE CARD */}
                        <div className='block md:hidden'>
                          {aiProvider.embeddingModels.map((embeddingModel, index) => {
                            return (
                              <Fragment key={embeddingModel.id}>
                                <DataCard.Item collapsible href={`/embedding-models/${embeddingModel.id}`}>
                                  <DataCard.ItemLabel>
                                    <span className='flex items-center gap-2'>
                                      {formatModelName(embeddingModel.providerModelName)}
                                      <RecommendedBadge recommended={embeddingModel.recommended} tooltipText='Recommended' />
                                    </span>
                                  </DataCard.ItemLabel>
                                  <DataCard.ItemCollapsibleContent>
                                    <DataCard.ItemDataGrid
                                      data={[
                                        {
                                          label: 'Output',
                                          value: <>{scientificNumConvert(embeddingModel.dollarPerInputToken)}</>,
                                        },
                                      ]}
                                      variant='secondary'
                                    />
                                  </DataCard.ItemCollapsibleContent>
                                  <DataCard.ItemDataGrid
                                    data={[
                                      {
                                        label: '$/Input',
                                        value: <>${scientificNumConvert(embeddingModel.dollarPerInputToken)}</>,
                                      },
                                      {
                                        label: '$/Output',
                                        value: <>${scientificNumConvert(embeddingModel.dollarPerOutputToken)}</>,
                                      },
                                    ]}
                                  />
                                </DataCard.Item>
                                {aiProvider.embeddingModels.length - 1 !== index && <DataCard.Divider />}
                              </Fragment>
                            );
                          })}
                        </div>
                      </DataCard.Wrapper>
                    </>
                  )}

                  {/* REASONING MODELS WRAPPER */}
                  {aiProvider.reasoningModels && aiProvider.reasoningModels.length > 0 && (
                    <>
                      <div className='flex items-center justify-between px-3 pt-3 md:hidden'>
                        <span className='text-xs text-neutral-01 font-semibold'>Reasoning model</span>
                        <Tooltip
                          side='top'
                          trigger={<Icons.info className='text-neutral-02 inline-block size-4' />}
                          content={'Reasoning model'}
                        />
                      </div>

                      <DataCard.Wrapper className='mt-3'>
                        {/* DESKTOP TABLE */}
                        <div className='md:block hidden'>
                          <Table
                            columns={reasoningModelColumns}
                            data={aiProvider.reasoningModels}
                            getRowUrl={(reasoningModel) => `/reasoning-models/${reasoningModel.id}`}
                          />
                        </div>

                        {/* MOBILE CARD */}
                        <div className='block md:hidden'>
                          {aiProvider.reasoningModels.map((reasoningModel, index) => {
                            return (
                              <Fragment key={reasoningModel.id}>
                                <DataCard.Item collapsible href={`/reasoning-models/${reasoningModel.id}`}>
                                  <DataCard.ItemLabel>
                                    <span className='flex items-center gap-2'>
                                      {reasoningModel.providerModelName}
                                      <RecommendedBadge recommended={reasoningModel.recommended} tooltipText='Recommended' />
                                    </span>
                                  </DataCard.ItemLabel>
                                  <DataCard.ItemCollapsibleContent>
                                    <DataCard.ItemDataGrid
                                      data={[
                                        {
                                          label: 'Output',
                                          value: <>{scientificNumConvert(reasoningModel.dollarPerInputToken)}</>,
                                        },
                                        {
                                          label: 'Average Time Taken',
                                          value: '1153 ms',
                                        },
                                      ]}
                                      variant='secondary'
                                    />
                                  </DataCard.ItemCollapsibleContent>
                                  <DataCard.ItemDataGrid
                                    data={[
                                      {
                                        label: '$/Input',
                                        value: <>${scientificNumConvert(reasoningModel.dollarPerInputToken)}</>,
                                      },
                                      {
                                        label: '$/Output',
                                        value: <>${scientificNumConvert(reasoningModel.dollarPerOutputToken)}</>,
                                      },
                                    ]}
                                  />
                                </DataCard.Item>
                                {aiProvider.reasoningModels.length - 1 !== index && <DataCard.Divider />}
                              </Fragment>
                            );
                          })}
                        </div>
                      </DataCard.Wrapper>
                    </>
                  )}
                </div>

                {(aiProvider.chatModels.length > 0 ||
                  aiProvider.embeddingModels.length > 0 ||
                  (aiProvider.reasoningModels && aiProvider.reasoningModels.length > 0)) && (
                  <span className='text-xs text-neutral-01 font-semibold flex items-center justify-end mt-2'>
                    Prices are per million token
                  </span>
                )}
                {/* Show message if no models */}
                {aiProvider.chatModels.length === 0 &&
                  aiProvider.embeddingModels.length === 0 &&
                  (!aiProvider.reasoningModels || aiProvider.reasoningModels.length === 0) && (
                    <DataCard.Wrapper>
                      <DataCard.Text>No models found</DataCard.Text>
                    </DataCard.Wrapper>
                  )}
              </DataCard.Root>
            </div>
          );
        })}
      </div>
      <Outlet />
    </>
  );
}
