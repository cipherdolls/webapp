import { Outlet } from 'react-router';
import type { AiProvider, ChatModel, EmbeddingModel } from '~/types';
import type { Route } from './+types/_main._general.preferences.ai';
import Table from '~/components/Table';
import type { TTableColumn } from '~/components/Table';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { DataCard } from '~/components/DataCard';
import { Fragment } from 'react/jsx-runtime';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { ViewButton } from '~/components/preferencesViewButton';
import { getPicture } from '~/utils/getPicture';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'AiProviders' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const res = await fetchWithAuth(`ai-providers`);
  return await res.json();
}

export default function AiProvidersIndex({ loaderData }: Route.ComponentProps) {
  const aiProviders: AiProvider[] = loaderData;

  const columnProperties: Array<TTableColumn<ChatModel | EmbeddingModel>> = [
    {
      id: 'name',
      label: 'Name',
      render: (data) => <span className='font-semibold'>{data.name}</span>,
      align: 'left',
    },
    {
      id: 'dollarPerInputToken',
      label: 'Input',
      render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerInputToken)}</span>,
      align: 'right',
      width: '200px',
    },
    {
      id: 'dollarPerOutputToken',
      label: 'Output',
      render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerOutputToken)}</span>,
      align: 'right',
      width: '200px',
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
                  extra={<ViewButton link={`/ai-providers/${aiProvider.id}`} />}
                >
                  <div className='size-10'>
                    <img
                      src={getPicture(aiProvider, 'ai-providers', false)}
                      srcSet={getPicture(aiProvider, 'ai-providers', true)}
                      alt={aiProvider.name}
                      className='size-full object-cover rounded-lg'
                    />
                  </div>
                  {aiProvider.name}
                </DataCard.Label>
                <DataCard.Wrapper>
                  {aiProvider.chatModels.length > 0 || aiProvider.embeddingModels.length > 0 ? (
                    <>
                      {/* DESKTOP TABLE */}
                      <Table
                        columns={columnProperties}
                        data={[...aiProvider.chatModels, ...aiProvider.embeddingModels]}
                        wrapperClassName='hidden md:block'
                      />

                      {/* MOBILE CARD */}
                      {aiProvider.chatModels.map((chatModel, index) => {
                        return (
                          <Fragment key={chatModel.id}>
                            <DataCard.Item key={chatModel.id} collapsible className='block md:hidden'>
                              <DataCard.ItemLabel>{chatModel.name}</DataCard.ItemLabel>
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
                            {aiProvider.chatModels.length - 1 !== index && <DataCard.Divider className='block md:hidden' />}
                          </Fragment>
                        );
                      })}
                    </>
                  ) : (
                    <DataCard.Text>No models found</DataCard.Text>
                  )}
                </DataCard.Wrapper>
                <span className='text-xs text-neutral-01 font-semibold flex items-center justify-end mt-2'>
                  Prices are per million token
                </span>
              </DataCard.Root>
            </div>
          );
        })}
      </div>
      <Outlet />
    </>
  );
}
