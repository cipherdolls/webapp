import { Outlet } from 'react-router';
import type { SttProvider } from '~/types';
import type { Route } from './+types/_main._general.services.stt';
import { DataCard } from '~/components/DataCard';
import Table, { type TTableColumn } from '~/components/Table';
import { Fragment } from 'react/jsx-runtime';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { getPicture } from '~/utils/getPicture';
import { ViewButton } from '~/components/preferencesViewButton';
import { InformationBadge } from '~/components/ui/InformationBadge';
import React, { useEffect, useState } from 'react';
import Tooltip from '~/components/ui/tooltip';
import { Icons } from '~/components/ui/icons';
import RecommendedBadge from '~/components/ui/RecommendedBadge';

function STTSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-10 pb-5'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='flex flex-col gap-4'>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full max-w-[200px] animate-pulse'></div>
          <div className='rounded-[10px] h-[170px] bg-gradient-1 w-full animate-pulse'></div>
        </div>
      ))}
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'STT Providers' }];
}

export async function clientLoader() {
  const res = await fetchWithAuth(`stt-providers`);
  return await res.json();
}

export default function SttProvidersIndex({ loaderData }: Route.ComponentProps) {
  const sttProviders: SttProvider[] = loaderData;
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
        <STTSkeleton />
        <Outlet />
      </>
    );
  }

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
          {data.recommended && (
            <>
              <Icons.checkCircle /> <RecommendedBadge recommended={data.recommended} />
            </>
          )}
        </div>
      ),
      align: 'left',
    },
    {
      id: 'dollarPerSecond',
      label: 'Output',
      headerClassName: 'pr-11',
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
      tooltipText: 'Cost 1 unit of the token you received at the same rate',
    },
  ];

  return (
    <>
      <DataCard.Root>
        <DataCard.Label className='flex gap-1 items-center'>
          STT Providers <InformationBadge tooltipText='Services for converting speech to text.' />
        </DataCard.Label>
        <DataCard.Wrapper>
          {/* DESKTOP */}
          <Table
            wrapperClassName='hidden md:block'
            columns={columnProperties}
            data={sttProviders}
            getRowUrl={(stt) => `/stt-providers/${stt.id}`}
          />

          {/* MOBILE */}
          <div className='block md:hidden'>
            {sttProviders.map((sttProvider, index) => {
              return (
                <Fragment key={sttProvider.id}>
                  <DataCard.Item key={sttProvider.id} href={`/stt-providers/${sttProvider.id}`}>
                    <DataCard.ItemLabel>
                      <div className='flex items-center justify-start gap-2'>
                        <div className='size-6'>
                          <img
                            src={getPicture(sttProvider, 'stt-providers', false)}
                            srcSet={getPicture(sttProvider, 'stt-providers', true)}
                            alt={sttProvider.name}
                            className='size-full object-cover rounded-lg'
                          />
                        </div>

                        {sttProvider.name}

                        {sttProvider.recommended && (
                          <>
                            <Icons.checkCircle /> <RecommendedBadge recommended={sttProvider.recommended} />
                          </>
                        )}
                      </div>

                      <ViewButton
                        popoverItems={[
                          { text: 'Edit', href: `/services/stt/stt-providers/${sttProvider.id}/edit` },
                          {
                            text: 'Delete',
                            href: `/services/stt/stt-providers/${sttProvider.id}/delete`,
                            isDelete: true,
                          },
                        ]}
                      />
                    </DataCard.ItemLabel>
                    <DataCard.ItemDataGrid
                      data={[
                        {
                          label: (
                            <div className='flex items-center'>
                              <span>Output</span>
                              <Tooltip
                                side='top'
                                trigger={<Icons.info className='inline-block size-4 ml-1' />}
                                content={columnProperties[1].tooltipText}
                              />
                            </div>
                          ),
                          value: <>${sttProvider.dollarPerSecond * 60}</>,
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
