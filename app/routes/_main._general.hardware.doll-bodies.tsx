import { Link, Outlet, redirect } from 'react-router';
import type { DollBody } from '~/types';
import { DataCard } from '~/components/DataCard';
import Table, { type TTableColumn } from '~/components/Table';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.hardware.doll-bodies';
import { ViewButton } from '~/components/preferencesViewButton';
import { formatDate } from '~/utils/date.utils';
import { useEffect, useState } from 'react';

function HardwareSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-16 pb-5'>
      {Array.from({ length: count }).map((_, i) => (
        <div className='flex flex-col gap-4'>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse max-w-[200px]'></div>
          <div className='rounded-[10px] h-[205px] bg-gradient-1 w-full animate-pulse'></div>
        </div>
      ))}
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Doll Bodies' }];
}

export async function clientLoader() {
  const res = await fetchWithAuth(`doll-bodies`);
  return await res.json();
}

export default function DollBodiesIndex({ loaderData }: Route.ComponentProps) {
  const dollBodies: DollBody[] = loaderData;

  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  useEffect(() => {
    if (loaderData) {
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [loaderData]);

  if (!hasInitiallyLoaded || !loaderData) {
    return (
      <>
        <HardwareSkeleton />
        <Outlet />
      </>
    );
  }

  const columnProperties: Array<TTableColumn<DollBody>> = [
    {
      id: 'name',
      label: 'Default Avatar',
      render: (data) => <span className='font-semibold'>{data.avatar.name}</span>,
      align: 'left',
    },

    {
      id: 'createdAt',
      label: 'Created At',
      render: (data) => formatDate(data.createdAt),
      align: 'right',
    },
  ];

  return (
    <>
      <div className='space-y-10 pb-5'>
        {dollBodies.map((dollBody) => (
          <DataCard.Root key={dollBody.id}>
            <DataCard.Label
              extra={
                <ViewButton
                  popoverItems={[
                    { text: 'Add Chat Model', href: '/chat-model/new' },
                    { text: 'Add Embedding Model', href: '/embedding-model/new' },
                    { text: 'Delete', href: '/delete-item', isDelete: true },
                  ]}
                />
              }
            >
              {dollBody.name}
            </DataCard.Label>
            <DataCard.Wrapper>
              <Table columns={columnProperties} data={[dollBody]} wrapperClassName='hidden md:block' />

              <DataCard.Item collapsible className='md:hidden'>
                <DataCard.ItemLabel>{dollBody.name}</DataCard.ItemLabel>
                <DataCard.ItemCollapsibleContent>
                  <DataCard.ItemDataGrid
                    variant='secondary'
                    data={columnProperties.map((column) => {
                      return {
                        label: column.label,
                        value: column.render(dollBody),
                      };
                    })}
                  />
                </DataCard.ItemCollapsibleContent>
              </DataCard.Item>
              <DataCard.Text>{dollBody.description}</DataCard.Text>
            </DataCard.Wrapper>
          </DataCard.Root>
        ))}
      </div>
      <Outlet />
    </>
  );
}
