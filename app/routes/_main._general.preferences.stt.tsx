import { Outlet, redirect } from 'react-router';
import type { SttProvider } from '~/types';
import type { Route } from './+types/_main._general.preferences.stt';
import { DataCard } from '~/components/DataCard';
import Table, { type TTableColumn } from '~/components/Table';
import { Fragment } from 'react/jsx-runtime';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { getPicture } from '~/utils/getPicture';
import { ViewButton } from '~/components/preferencesViewButton';
import { scientificNumConvert } from '~/utils/scientificNumConvert';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'STT Providers' }];
}

export async function clientLoader() {
  const res = await fetchWithAuth(`stt-providers`);
  return await res.json();
}

export default function SttProvidersIndex({ loaderData }: Route.ComponentProps) {
  const sttProviders: SttProvider[] = loaderData;

  const columnProperties: Array<TTableColumn<SttProvider>> = [
    {
      id: 'name',
      label: 'Name',
      render: (data) => (
        <div className='flex items-center gap-3'>
          <div className='size-10'>
            <img
              src={getPicture(data, 'stt-providers', false)}
              srcSet={getPicture(data, 'stt-providers', true)}
              alt={data.name}
              className='size-full object-cover rounded-lg'
            />
          </div>
          <span className='font-semibold'>{data.name}</span>
        </div>
      ),
      align: 'left',
    },
    {
      id: 'dollarPerSecond',
      label: '$/Output',
      render: (data) => (
        <div className='flex items-center justify-end gap-2.5'>
          <span className='font-semibold'>${data.dollarPerSecond * 60}</span>
          <ViewButton link={`/stt-providers/${data.id}`} />
        </div>
      ),
      align: 'right',
    },
  ];

  return (
    <>
      <DataCard.Root>
        <DataCard.Label>STT Providers</DataCard.Label>
        <DataCard.Wrapper>
          <Table wrapperClassName='hidden md:block' columns={columnProperties} data={sttProviders} />
          <div className='block md:hidden'>
            {sttProviders.map((sttProvider, index) => {
              return (
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
              );
            })}
          </div>
        </DataCard.Wrapper>
      </DataCard.Root>
      <Outlet />
    </>
  );
}
