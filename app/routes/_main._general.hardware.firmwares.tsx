import type { Firmware } from '~/types';
import { DataCard } from '~/components/DataCard';
import Table, { type TTableColumn } from '~/components/Table';
import { Fragment } from 'react/jsx-runtime';
import type { Route } from './+types/_main._general.hardware.firmwares';
import { InstallButton } from '~/components/buttons/InstallButton';
import { apiUrl } from '~/constants';
import { useFirmwares } from '~/hooks/queries/filmwareQuries';

function FirmwareSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-4 pb-5'>
      {Array.from({ length: count }).map((_, i) => (
        <div className='flex flex-col gap-4' key={i}>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse max-w-[110px]'></div>
          <div className='rounded-[10px] h-[205px] bg-gradient-1 w-full animate-pulse'></div>
        </div>
      ))}
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Firmwares' }];
}

export default function FirmwaresIndex() {
  const { data: firmwares, isLoading: isLoadingFirmwares } = useFirmwares();

  if (isLoadingFirmwares) {
    return (
      <>
        <FirmwareSkeleton />
      </>
    );
  }

  const columnProperties: Array<TTableColumn<Firmware>> = [
    {
      id: 'version',
      label: 'Version',
      render: (data) => (
        <>
          <span className='font-semibold'>{data.version}</span>
          <span className='ml-3 text-specials-success font-semibold'>New</span>
        </>
      ),
      align: 'left',
    },
    {
      id: 'createdAt',
      label: 'Release date',
      render: (data) => data.createdAt.toString(),
      align: 'right',
    },

    {
      id: 'bin',
      label: 'Download',
      render: (data) => <InstallButton manifest={`${apiUrl}/firmwares/${data.id}/manifest.json`} label='Flash Device' />,
      align: 'right',
    },
  ];

  const columnHistoryProperties: Array<TTableColumn<Firmware>> = [
    {
      id: 'version',
      label: 'Version',
      render: (data) => <span className='font-semibold'>{data.version}</span>,
      align: 'left',
    },
    {
      id: 'createdAt',
      label: 'Release date',
      render: (data) => data.createdAt.toString(),
      align: 'right',
    },
  ];

  return (
    <>
      <DataCard.Root>
        <DataCard.Label>Current</DataCard.Label>
        <DataCard.Wrapper>
          {firmwares ? (
            <>
              <Table wrapperClassName='hidden md:block' columns={columnProperties} data={firmwares} />
              <div className='block md:hidden'>
                {firmwares.map((firmware, index) => (
                  <Fragment key={firmware.id}>
                    <DataCard.Item key={firmware.id}>
                      <DataCard.ItemLabel>
                        <div>
                          {firmware.version} <span className='ml-3 text-specials-success font-semibold'>New</span>
                        </div>

                        <span className='font-normal'>{firmware.createdAt.toString()}</span>
                      </DataCard.ItemLabel>

                      <DataCard.ItemDataGrid
                        variant={'mobile'}
                        data={[
                          {
                            label: '',
                            value: (
                              <InstallButton
                                className='w-full'
                                manifest={`${apiUrl}/firmwares/${firmware.id}/manifest.json`}
                                label='Flash Device'
                              />
                            ),
                          },
                        ]}
                      />
                    </DataCard.Item>
                    {firmwares.length - 1 !== index && <DataCard.Divider />}
                  </Fragment>
                ))}
              </div>
            </>
          ) : (
            <p className='text-body-lg text-base-black text-center'>No firmwares found</p>
          )}
        </DataCard.Wrapper>
      </DataCard.Root>

      <DataCard.Root>
        <DataCard.Label>History</DataCard.Label>
        <DataCard.Wrapper className='bg-white/0 bg-gradient-1'>
          {firmwares ? (
            <>
              <Table wrapperClassName='hidden md:block' columns={columnHistoryProperties} data={firmwares} />
              <div className='block md:hidden bg-white/0 bg-gradient-1'>
                {firmwares.map((firmware, index) => (
                  <Fragment key={firmware.id}>
                    <DataCard.Item key={firmware.id}>
                      <DataCard.ItemDataGrid
                        data={[
                          {
                            label: <span className='font-semibold text-base-black'>{firmware.version}</span>,
                            value: <span className='font-normal'>{firmware.createdAt.toString()}</span>,
                          },
                        ]}
                      />
                    </DataCard.Item>
                    {firmwares.length - 1 !== index && <DataCard.Divider />}
                  </Fragment>
                ))}
              </div>
            </>
          ) : (
            <p className='text-body-lg text-base-black text-center'>No firmwares found</p>
          )}
        </DataCard.Wrapper>
      </DataCard.Root>
    </>
  );
}
