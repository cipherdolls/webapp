import { Link, Outlet, redirect } from 'react-router';
import type { AiProvider, ChatModel, EmbeddingModel } from '~/types';
import type { Route } from './+types/_main._general.preferences.ai';
import Table from '~/components/Table';
import type { TTableColumn } from '~/components/Table';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { DataCard } from '~/components/DataCard';
import { Fragment } from 'react/jsx-runtime';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { Icons } from '~/components/ui/icons';

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
      label: 'Output',
      render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerInputToken)}</span>,
      align: 'right',
    },
    {
      id: 'dollarPerOutputToken',
      label: 'Output',
      render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerOutputToken)}</span>,
      align: 'right',
    },
  ];

  return (
    <>
      <div className='flex flex-col gap-10 pb-5'>
        {aiProviders.map((aiProvider) => {
          const EditButton = () => {
            return (
              <Link to={`/ai-providers/${aiProvider.id}`} className='hover:opacity-50 transition-colors'>
                <Icons.eye className='text-base-black' />
              </Link>
            );
          };
          return (
            <div key={aiProvider.id} className='flex flex-col gap-5'>
              <DataCard.Root>
                <DataCard.Label className='text-2xl font-semibold' extra={<EditButton />}>
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
                    <DataCard.Text>No chat models found</DataCard.Text>
                  )}
                </DataCard.Wrapper>
              </DataCard.Root>
            </div>
          );
        })}
      </div>
      <Outlet />
    </>
  );
}
