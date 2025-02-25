import { redirect } from 'react-router';
import type { AiProvider, ChatModel } from '~/types';
import type { Route } from './+types/_main.preferences.ai';
import Table from '~/components/Table';
import type { TTableColumn } from '~/components/Table';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { DataCard } from '~/components/DataCard';
import { Fragment } from 'react/jsx-runtime';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'AiProviders' }];
}

export async function clientLoader() {
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const headers = {
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
  };
  try {
    const res = await fetch(`${backendUrl}/ai-providers`, headers);
    return await res.json();
  } catch (error) {
    console.error(error);
    return redirect('/signin');
  }
}

export default function AiProvidersIndex({ loaderData }: Route.ComponentProps) {
  const aiProviders: AiProvider[] = loaderData;

  const columnProperties: Array<TTableColumn<ChatModel>> = [
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
    <div className='space-y-10 pb-5'>
      {aiProviders.map((aiProvider) => (
        <div key={aiProvider.id} className='space-y-5'>
          <DataCard.Root>
            <DataCard.Label>{aiProvider.name}</DataCard.Label>
            <DataCard.Wrapper>
              {aiProvider.chatModels.length > 0 ? (
                <>
                  {/* DESKTOP TABLE */}
                  <Table columns={columnProperties} data={aiProvider.chatModels} wrapperClassName='hidden md:block' />

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
      ))}
    </div>
  );
}
