import { Link, Outlet, redirect } from 'react-router';
import type { TtsProvider, TtsVoice } from '~/types';
import type { Route } from './+types/_main._general.services.tts';

interface EnhancedTtsVoice extends TtsVoice {
  providerName: string;
  providerId: string;
}
import { DataCard } from '~/components/DataCard';
import Table from '~/components/Table';
import type { TTableColumn } from '~/components/Table';
import PlayerButton from '~/components/PlayerButton';
import { PATHS } from '~/constants';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { ViewButton } from '~/components/preferencesViewButton';
import { getPicture } from '~/utils/getPicture';
import { InformationBadge } from '~/components/ui/InformationBadge';
import RecommendedBadge from '~/components/ui/RecommendedBadge';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'TTS Providers' }];
}

export async function clientLoader() {
  const res = await fetchWithAuth(`tts-providers`);
  return await res.json();
}

export default function TtsProvidersIndex({ loaderData }: Route.ComponentProps) {
  const ttsProviders: TtsProvider[] = loaderData;

  const columnProperties: Array<TTableColumn<EnhancedTtsVoice>> = [
    {
      id: 'name',
      label: 'Name',
      render: (data) => (
        <div className='flex items-center gap-3'>
          <PlayerButton variant='secondary' audioSrc={PATHS.ttsVoice(data.id)} />
          <span className='font-semibold text-body-md flex items-center gap-2'>
            {data.name}
            <RecommendedBadge recommended={data.recommended} tooltipText='Recommended' />
          </span>
        </div>
      ),
      align: 'left',
    },
    {
      id: 'id',
      label: '',
      render: (data) => (
        <ViewButton
          popoverItems={[
            { text: 'Edit', href: `/services/tts/tts-voices/${data.id}/edit?providerName=${encodeURIComponent(data.providerName)}` },
            { text: 'Delete', href: `/services/tts/tts-voices/${data.id}/delete`, isDelete: true },
          ]}
          className='flex items-center justify-center'
          isDataCard={true}
        />
      ),
      width: '44px',
      align: 'right',
    },
  ];

  return (
    <>
      <div className='space-y-10 pb-5'>
        {ttsProviders.map((ttsProvider) => {
          const enhancedTtsVoices = ttsProvider.ttsVoices.map((voice) => ({
            ...voice,
            providerName: ttsProvider.name,
            providerId: ttsProvider.id,
          }));

          return (
            <DataCard.Root key={ttsProvider.id}>
              <DataCard.Label
                className='text-2xl font-semibold flex items-center gap-2'
                extra={
                  <div className='flex items-center gap-6'>
                    <div className='flex items-center gap-2 text-body-sm'>
                      <span className='text-base-black font-normal'>$/Character</span>
                      <span className='text-neutral-01 font-normal'>-</span>
                      <span className='font-semibold text-base-black'>$0</span>
                    </div>
                    <ViewButton
                      popoverItems={[
                        { text: 'Edit TTS Provider', href: `/services/tts/tts-providers/${ttsProvider.id}/edit` },

                        { text: 'Add TTS Voice', href: `/services/tts/tts-voice/new?id=${ttsProvider.id}&name=${ttsProvider.name}` },
                        {
                          text: 'Delete',
                          href: `/services/tts/providers/delete?id=${ttsProvider.id}&name=${ttsProvider.name}`,
                          isDelete: true,
                        },
                      ]}
                    />
                  </div>
                }
              >
                <div className='size-6'>
                  <img
                    src={getPicture(ttsProvider, 'tts-providers', false)}
                    srcSet={getPicture(ttsProvider, 'tts-providers', true)}
                    alt={ttsProvider.name}
                    className='size-full object-cover rounded-lg'
                  />
                </div>
                <div className='flex items-center gap-1'>
                  {ttsProvider.name}
                  <InformationBadge
                    tooltipText='Real-time AI voice synthesis for apps and assistants'
                    side={{
                      default: 'top',
                      lg: 'right',
                    }}
                  />
                </div>
              </DataCard.Label>
              <DataCard.Wrapper>
                {enhancedTtsVoices.length > 0 ? (
                  <Table hideHeader={true} columns={columnProperties} data={enhancedTtsVoices} />
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
