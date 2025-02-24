import { redirect } from 'react-router';
import type { SttProvider } from '~/types';
import type { Route } from './+types/_main.preferences.stt';
import { DataCard } from '~/components/ui/DataCard';
import Table, { type TTableColumn } from '~/components/ui/Table';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'STT Providers' }];
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
    const res = await fetch(`${backendUrl}/stt-providers`, headers);
    return await res.json();
  } catch (error) {
    console.error(error);
    return redirect('/signin');
  }
}

export default function SttProvidersIndex({ loaderData }: Route.ComponentProps) {
  const sttProviders: SttProvider[] = loaderData;

  const columnProperties: Array<TTableColumn<SttProvider>> = [
    {
      id: 'name',
      label: 'Name',
      setContent: (data) => <span className='font-semibold'>{data.name}</span>,
      align: 'left',
    },
    {
      id: 'dollarPerSecond',
      label: '$/Output',
      setContent: (data) => <span className='font-semibold'>${data.dollarPerSecond}</span>,
      align: 'right',
    },
  ];

  return (
    <>
      <DataCard.Root>
        <DataCard.Label>SttProviders</DataCard.Label>
        <DataCard.Wrapper>
          <Table wrapperClassName='hidden md:block' hideHeader={true} columns={columnProperties} data={sttProviders} />

          <div className='block md:hidden'>
            {sttProviders.map((sttProvider) => (
              <DataCard.Item key={sttProvider.id}>
                <DataCard.ItemLabel>{sttProvider.name}</DataCard.ItemLabel>
                <DataCard.ItemDataGrid
                  data={[
                    {
                      label: '$/Output',
                      value: <>$${sttProvider.dollarPerSecond}</>,
                    },
                  ]}
                />
              </DataCard.Item>
            ))}
          </div>
        </DataCard.Wrapper>
      </DataCard.Root>
    </>
  );
}
