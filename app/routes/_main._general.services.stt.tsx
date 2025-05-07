import { Outlet, redirect } from 'react-router';
import type { SttProvider } from '~/types';
import type { Route } from './+types/_main._general.services.stt';
import { DataCard } from '~/components/DataCard';
import Table, { type TTableColumn } from '~/components/Table';
import { Fragment } from 'react/jsx-runtime';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { getPicture } from '~/utils/getPicture';
import { ViewButton } from '~/components/preferencesViewButton';
import { InformationBadge } from '~/components/ui/InformationBadge';

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
        <div className='flex items-center gap-2'>
          <div className='size-6'>
            <img
              src={getPicture(data, 'stt-providers', false)}
              srcSet={getPicture(data, 'stt-providers', true)}
              alt={data.name}
              className='size-full object-cover rounded-lg'
            />
          </div>
          <span className='font-semibold text-body-md'>{data.name}</span>
        </div>
      ),
      align: 'left',
    },
    {
      id: 'dollarPerSecond',
      label: 'Output',
      render: (data) => (
        <div className='flex items-center justify-end gap-2.5'>
          <span className='text-body-sm'>${data.dollarPerSecond * 60}</span>
          <ViewButton
            popoverItems={[
              { text: 'Edit', href: `/services/stt/stt-providers/${data.id}/edit` },
              {
                text: 'Delete',
                href: `/services/stt/stt-providers/${data.id}/delete`,
                isDelete: true,
              },
            ]}
          />
        </div>
      ),
      align: 'right',
    },
    {
      id: 'id',
      label: '',
      render: () => <div className=''></div>,
      align: 'right',
      width: '44px',
    },
  ];

  return (
    <>
      <DataCard.Root>
        <DataCard.Label className='flex gap-1 items-center'>
          STT Providers <InformationBadge tooltipText='Services for converting speech to text.' />
        </DataCard.Label>
        <DataCard.Wrapper>
          <Table
            wrapperClassName='hidden md:block'
            columns={columnProperties}
            data={sttProviders}
            getRowUrl={(stt) => `/stt-providers/${stt.id}`}
          />
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
