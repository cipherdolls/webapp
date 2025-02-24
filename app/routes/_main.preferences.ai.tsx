import { redirect } from 'react-router';
import type { AiProvider, ChatModel } from '~/types';
import type { Route } from './+types/_main.preferences.ai';
import Table from '~/components/ui/Table';
import type { TTableColumn } from '~/components/ui/Table';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { DataCard } from '~/components/ui/DataCard';

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
      setContent: (data) => <span className='font-semibold'>{data.name}</span>,
      align: 'left',
    },
    {
      id: 'dollarPerInputToken',
      label: 'Output',
      setContent: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerInputToken)}</span>,
      align: 'right',
    },
    {
      id: 'dollarPerOutputToken',
      label: 'Output',
      setContent: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerOutputToken)}</span>,
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
              <div className='hidden md:block'>
                <Table columns={columnProperties} data={aiProvider.chatModels} />
              </div>
              <div className='block md:hidden'>
                {aiProvider.chatModels.map((chatModel) => {
                  return (
                    <DataCard.Item key={chatModel.id} collapsible>
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
                  );
                })}
              </div>
            </DataCard.Wrapper>
          </DataCard.Root>
        </div>
      ))}
    </div>
  );
}
