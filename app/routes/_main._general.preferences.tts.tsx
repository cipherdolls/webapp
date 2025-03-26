import { Outlet, redirect } from 'react-router';
import type { TtsProvider, TtsVoice } from '~/types';
import type { Route } from './+types/_main._general.preferences.tts';
import { DataCard } from '~/components/DataCard';
import Table from '~/components/Table';
import type { TTableColumn } from '~/components/Table';
import PlayerButton from '~/components/PlayerButton';
import { PATHS } from '~/constants';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { ViewButton } from '~/components/preferencesViewButton';
import { getPicture } from '~/utils/getPicture';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'TTS Providers' }];
}

export async function clientLoader() {
  const res = await fetchWithAuth(`tts-providers`);
  return await res.json();
}

export default function TtsProvidersIndex({ loaderData }: Route.ComponentProps) {
  const ttsProviders: TtsProvider[] = loaderData;

  const columnProperties: Array<TTableColumn<TtsVoice>> = [
    {
      id: 'name',
      label: 'Name',
      render: (data) => <span className='font-semibold'>{data.name}</span>,
      align: 'left',
    },
    {
      id: 'id',
      label: 'Preview',
      render: (data) => <PlayerButton variant='secondary' audioSrc={PATHS.ttsVoice(data.id)} />,
      align: 'right',
      width: '100px',
    },
  ];

  return (
    <>
      <div className='space-y-10 pb-5'>
        {ttsProviders.map((ttsProvider) => {
          const ExtraSection = () => {
            return (
              <div className='flex items-center gap-3'>
                <p className='text-body-sm text-base-black break-words'>
                  $/Character <span className='text-neutral-01'>-</span> <b className='font-semibold'>${ttsProvider.dollarPerCharacter}</b>
                </p>
                •
                <ViewButton link={`/tts-providers/${ttsProvider.id}`} />
              </div>
            );
          };
          return (
            <DataCard.Root key={ttsProvider.id}>
              <DataCard.Label className='text-2xl font-semibold flex items-center gap-2' extra={<ExtraSection />}>
                <div className='size-10'>
                  <img
                    src={getPicture(ttsProvider, 'tts-providers', false)}
                    srcSet={getPicture(ttsProvider, 'tts-providers', true)}
                    alt={ttsProvider.name}
                    className='size-full object-cover rounded-lg'
                  />
                </div>
                {ttsProvider.name}
              </DataCard.Label>
              <DataCard.Wrapper>
                {ttsProvider.ttsVoices.length > 0 ? (
                  <Table hideHeader={true} columns={columnProperties} data={ttsProvider.ttsVoices} />
                ) : (
                  <DataCard.Text>No TTS Voices found</DataCard.Text>
                )}
              </DataCard.Wrapper>
            </DataCard.Root>
          );
        })}
      </div>
      <Outlet />
    </>
  );
}
