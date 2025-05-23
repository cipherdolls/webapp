import { Outlet } from 'react-router';
import type { AiProvider, ChatModel, EmbeddingModel } from '~/types';
import type { Route } from './+types/_main._general.services.ai';
import Table from '~/components/Table';
import type { TTableColumn } from '~/components/Table';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { DataCard } from '~/components/DataCard';
import { Fragment } from 'react/jsx-runtime';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { ViewButton } from '~/components/preferencesViewButton';
import { getPicture } from '~/utils/getPicture';
import { RecommendedBadge } from '~/components/ui/RecommendedBadge';
import { InformationBadge } from '~/components/ui/InformationBadge';
import { formatModelName } from '~/utils/formatModelName';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'AiProviders' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const res = await fetchWithAuth(`ai-providers`);
  return await res.json();
}

export default function AiProvidersIndex({ loaderData }: Route.ComponentProps) {
  const aiProviders: AiProvider[] = loaderData;
  const chatModelColumns: Array<TTableColumn<ChatModel>> = [
    {
      id: 'providerModelName',
      label: 'Chat model',
      render: (data) => (
        <span className='font-semibold text-body-md flex items-center gap-2'>
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
                        { text: 'Add Chat Model', href: `/services/ai/chat-models/new?id=${aiProvider.id}&name=${aiProvider.name}` },
                        {
                          text: 'Add Embedding Model',
                          href: `/services/ai/embedding-models/new?id=${aiProvider.id}&name=${aiProvider.name}`,
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
                {aiProvider.chatModels.length > 0 && (
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
                )}

                {/* EMBEDDING MODELS WRAPPER */}
                {aiProvider.embeddingModels.length > 0 && (
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
                            <DataCard.Item collapsible>
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
                )}
                {(aiProvider.chatModels.length > 0 || aiProvider.embeddingModels.length > 0) && (
                  <span className='text-xs text-neutral-01 font-semibold flex items-center justify-end mt-2'>
                    Prices are per million token
                  </span>
                )}
                {/* Show message if no models */}
                {aiProvider.chatModels.length === 0 && aiProvider.embeddingModels.length === 0 && (
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
