import { Outlet } from 'react-router';
import type { TtsProvider, TtsVoice } from '~/types';
import type { Route } from './+types/_main._general.services.tts';
import { DataCard } from '~/components/DataCard';
import type { TTableColumn } from '~/components/Table';
import Table from '~/components/Table';
import PlayerButton from '~/components/PlayerButton';
import { PATHS } from '~/constants';
import { ViewButton } from '~/components/preferencesViewButton';
import { getPicture } from '~/utils/getPicture';
import { InformationBadge } from '~/components/ui/InformationBadge';
import RecommendedBadge from '~/components/ui/RecommendedBadge';
import { useTtsProviders } from '~/hooks/queries/ttsQueries';
import { useDeleteTtsProvider, useDeleteTtsVoice } from '~/hooks/queries/ttsMutations';
import { useConfirm } from '~/providers/AlertDialogProvider';

interface EnhancedTtsVoice extends TtsVoice {
  providerName: string;
  providerId: string;
}

function TTSSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-10 pb-5'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='flex flex-col gap-4'>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full max-w-[200px] animate-pulse'></div>
          <div className='rounded-[10px] h-screen bg-gradient-1 w-full animate-pulse'></div>
        </div>
      ))}
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'TTS Providers' }];
}

export default function TtsProvidersIndex() {
  const confirm = useConfirm();
  const { data: ttsProviders, isLoading } = useTtsProviders();
  const { mutate: deleteTtsProvider, isPending: isDeletingTtsProvider } = useDeleteTtsProvider();
  const { mutate: deleteTtsVoice, isPending: isDeletingTtsVoice } = useDeleteTtsVoice();

  if (isLoading) {
    return (
      <>
        <TTSSkeleton />
        <Outlet />
      </>
    );
  }

  const handleDeleteTtsProvider = async (ttsProvider: TtsProvider) => {
    const confirmResult = await confirm({
      title: `Delete provider ${ttsProvider.name}?`,
      body: 'By deleting an TTS provider all related data will be deleted as well. You will not be able to restore the data.',
      actionButton: 'Yes, Delete',
      cancelButton: 'No, Leave',
    });

    if (!confirmResult) return;

    deleteTtsProvider(ttsProvider.id);
  };

  const handleDeleteTtsVoice = async (ttsVoice: TtsVoice) => {
    const confirmResult = await confirm({
      title: `Delete voice ${ttsVoice.name}?`,
      body: 'By deleting an TTS voice all related data will be deleted as well. You will not be able to restore the data.',
      actionButton: 'Yes, Delete',
      cancelButton: 'No, Leave',
    });

    if (!confirmResult) return;

    deleteTtsVoice(ttsVoice.id);
  };

  const columnProperties: Array<TTableColumn<EnhancedTtsVoice>> = [
    {
      id: 'name',
      label: 'Name',
      render: (data) => (
        <div className='flex items-center gap-3'>
          <PlayerButton variant='secondary' audioSrc={PATHS.ttsVoice(data.id)} />
          <span className='font-semibold text-body-md flex items-center gap-2'>
            {data.name}
            {data.gender === 'Female' ? (
              <div className='flex items-center gap-1 bg-[#FF85B7] size-5 justify-center rounded-full text-label text-base-black font-semibold'>
                👩🏻
              </div>
            ) : data.gender === 'Male' ? (
              <div className='flex items-center gap-1 bg-[#85D2FF] size-5 justify-center rounded-full text-label text-base-black font-semibold'>
                🧔🏻‍♂️
              </div>
            ) : null}
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
            { text: 'Edit', href: `/services/tts/tts-providers/${data.providerId}/tts-voices/${data.id}/edit` },
            { text: 'Delete', onClick: () => handleDeleteTtsVoice(data), isDelete: true },
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
        {ttsProviders && ttsProviders.length > 0 ? (
          ttsProviders.map((ttsProvider) => {
            const enhancedTtsVoices = ttsProvider.ttsVoices.map((voice) => ({
              ...voice,
              providerName: ttsProvider.name,
              providerId: ttsProvider.id,
            }));

            return (
              <DataCard.Root key={ttsProvider.id}>
                <DataCard.Label
                  className='text-2xl font-semibold flex gap-2 sm:items-center'
                  extra={
                    <div className='flex items-center gap-6'>
                      <div className='hidden items-center gap-2 text-body-sm sm:flex'>
                        <span className='text-base-black font-normal'>$/Character</span>
                        <span className='text-neutral-01 font-normal'>-</span>
                        <span className='font-semibold text-base-black'>${ttsProvider.dollarPerCharacter}</span>
                      </div>
                      <ViewButton
                        popoverItems={[
                          { text: 'Edit TTS Provider', href: `/services/tts/tts-providers/${ttsProvider.id}/edit` },

                          {
                            text: 'Add TTS Voice',
                            href: `/services/tts/tts-providers/${ttsProvider.id}/tts-voice/new`,
                          },
                          {
                            text: 'Delete',
                            onClick: () => handleDeleteTtsProvider(ttsProvider),
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
                  <div className='flex flex-col gap-2'>
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

                    <div className='flex items-center gap-2 text-body-sm sm:hidden'>
                      <span className='text-neutral-01 font-normal'>$/Character</span>
                      <span className='font-semibold text-base-black'>$0</span>
                    </div>
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
          })
        ) : (
          <p className='text-body-md text-neutral-01 font-semibold text-center py-5'>No TTS Providers</p>
        )}
      </div>
      <Outlet />
    </>
  );
}
