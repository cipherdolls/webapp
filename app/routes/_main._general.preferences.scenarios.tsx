import { redirect } from 'react-router';
import type { Scenario } from '~/types';
import type { Route } from './+types/_main._general.preferences.scenarios';
import { DataCard } from '~/components/DataCard';
import Table, { type TTableColumn } from '~/components/Table';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Scenarios' }];
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
    const res = await fetch(`${backendUrl}/scenarios`, headers);
    return await res.json();
  } catch (error) {
    console.error(error);
    return redirect('/signin');
  }
}

export default function ScenariosIndex({ loaderData }: Route.ComponentProps) {
  const scenarios: Scenario[] = loaderData;

  console.log(scenarios);
  const columnProperties: Array<TTableColumn<Scenario>> = [
    {
      id: 'name',
      label: 'Name',
      render: (data) => <span className='font-semibold'>{data.name}</span>,
      align: 'left',
    },
    {
      id: 'chatModel',
      label: 'Chat Model Name',
      render: (data) => data.chatModel.name,
      align: 'right',
      width: '135px',
    },
    {
      id: 'temperature',
      label: 'Temperature',
      render: (data) => data.temperature,
      align: 'right',
      width: '115px',
    },
    {
      id: 'topP',
      label: 'TopP',
      render: (data) => data.topP,
      align: 'right',
      width: '80px',
    },
    {
      id: 'frequencyPenalty',
      label: 'Frequency Penalty',
      render: (data) => data.frequencyPenalty,
      align: 'right',
      width: '135px',
    },
    {
      id: 'presencePenalty',
      label: 'Presence Penalty',
      render: (data) => data.presencePenalty,
      align: 'right',
      width: '135px',
    },
  ];


  return (
    <>
      {/* <div className=''>Scenarios</div> */}
      <div className='space-y-10 pb-5'>
        {scenarios.map((scenario) => (
          <DataCard.Root key={scenario.id}>
            <DataCard.Label>{scenario.name}</DataCard.Label>
            <DataCard.Wrapper>
              <Table columns={columnProperties} data={[scenario]} wrapperClassName='hidden md:block' />

              <DataCard.Item collapsible className='md:hidden'>
                <DataCard.ItemLabel>{scenario.name}</DataCard.ItemLabel>
                <DataCard.ItemCollapsibleContent>
                  <DataCard.ItemDataGrid
                    variant='secondary'
                    data={columnProperties.map((column) => {
                      return {
                        label: column.label,
                        value: column.render(scenario),
                      };
                    })}
                  />
                </DataCard.ItemCollapsibleContent>
              </DataCard.Item>
              <DataCard.Text>{scenario.systemMessage}</DataCard.Text>
            </DataCard.Wrapper>
          </DataCard.Root>
        ))}
      </div>
    </>
  );
}
