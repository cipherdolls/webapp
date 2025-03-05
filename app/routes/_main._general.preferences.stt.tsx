import { redirect } from 'react-router';
import type { SttProvider } from '~/types';
import type { Route } from './+types/_main._general.preferences.stt';
import { DataCard } from '~/components/DataCard';
import Table, { type TTableColumn } from '~/components/Table';
import { Fragment } from 'react/jsx-runtime';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'STT Providers' }];
}


export async function clientLoader() {
  try {
    const res = await fetchWithAuth(`stt-providers`);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}


export default function SttProvidersIndex({ loaderData }: Route.ComponentProps) {
  const sttProviders: SttProvider[] = loaderData;

  const columnProperties: Array<TTableColumn<SttProvider>> = [
    {
      id: 'name',
      label: 'Name',
      render: (data) => <span className='font-semibold'>{data.name}</span>,
      align: 'left',
    },
    {
      id: 'dollarPerSecond',
      label: '$/Output',
      render: (data) => <span className='font-semibold'>${data.dollarPerSecond}</span>,
      align: 'right',
    },
  ];

  return (
    <>
      <DataCard.Root>
        <DataCard.Label>SttProviders</DataCard.Label>
        <DataCard.Wrapper>
          <Table wrapperClassName='hidden md:block' columns={columnProperties} data={sttProviders} />
          <div className='block md:hidden'>
            {sttProviders.map((sttProvider, index) => (
              <Fragment key={sttProvider.id}>
                <DataCard.Item key={sttProvider.id}>
                  <DataCard.ItemLabel>{sttProvider.name}</DataCard.ItemLabel>
                  <DataCard.ItemDataGrid
                    data={[
                      {
                        label: '$/Output',
                        value: <>${sttProvider.dollarPerSecond}</>,
                      },
                    ]}
                  />
                </DataCard.Item>
                {sttProviders.length - 1 !== index && <DataCard.Divider />}
              </Fragment>
            ))}
          </div>
        </DataCard.Wrapper>
      </DataCard.Root>
    </>
  );
}
