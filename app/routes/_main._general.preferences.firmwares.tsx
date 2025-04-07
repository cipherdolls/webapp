import { redirect } from 'react-router';
import type { Firmware, SttProvider } from '~/types';
import { DataCard } from '~/components/DataCard';
import Table, { type TTableColumn } from '~/components/Table';
import { Fragment } from 'react/jsx-runtime';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.preferences.firmwares';
import { InstallButton } from '~/components/buttons/InstallButton';
import { apiUrl } from '~/constants';


export function meta({}: Route.MetaArgs) {
  return [{ title: 'Firmwares' }];
}


export async function clientLoader() {
  const res = await fetchWithAuth(`firmwares`);
  return await res.json();
}


export default function FirmwaresIndex({ loaderData }: Route.ComponentProps) {
  const firmwares: Firmware[] = loaderData;

  const columnProperties: Array<TTableColumn<Firmware>> = [
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

    {
      id: 'bin',
      label: 'Download',
      render: (data) => <InstallButton
      manifest={`${apiUrl}/firmwares/${data.id}/manifest.json`}
      label="Flash Device"
    />,
      align: 'right',
    },

  ];

  return (
    <>

      <DataCard.Root>
        <DataCard.Label>Firmwares</DataCard.Label>
        <DataCard.Wrapper>
          <Table wrapperClassName='hidden md:block' columns={columnProperties} data={firmwares} />
          <div className='block md:hidden'>
            {firmwares.map((firmware, index) => (
              <Fragment key={firmware.id}>
                <DataCard.Item key={firmware.id}>
                  <DataCard.ItemLabel>{firmware.version}</DataCard.ItemLabel>

                  
                  <DataCard.ItemDataGrid
                    data={[
                      {
                        label: "Download",
                        value: <a href={`${apiUrl}/firmwares/${firmware.id}/download`} download>
                        Download
                      </a>,
                      },
                    ]}
                  />
                </DataCard.Item>
                {firmwares.length - 1 !== index && <DataCard.Divider />}
              </Fragment>
            ))}
          </div>
        </DataCard.Wrapper>
      </DataCard.Root>
    </>
  );
}
