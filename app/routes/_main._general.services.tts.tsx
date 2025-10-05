import { Outlet } from 'react-router';
import { useState } from 'react';
import type { TtsProvider, TtsVoice } from '~/types';
import type { Route } from './+types/_main._general.services.tts';
import { DataCard } from '~/components/DataCard';
import PlayerButton from '~/components/PlayerButton';
import { PATHS, ROUTES } from '~/constants';
import { ViewButton } from '~/components/preferencesViewButton';
import { getPicture } from '~/utils/getPicture';
import { InformationBadge } from '~/components/ui/InformationBadge';
import RecommendedBadge from '~/components/ui/RecommendedBadge';
import { useTtsProviders } from '~/hooks/queries/ttsQueries';
import { useDeleteTtsProvider, useDeleteTtsVoice } from '~/hooks/queries/ttsMutations';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';

type GenderFilter = 'all' | 'Female' | 'Male';

function TTSSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-10 pb-5'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-3'>
            <div className='flex justify-between items-center mb-1'>
              <div className='flex gap-2 items-center'>
                <div className='w-6 h-6 rounded-lg bg-neutral-04' />
                <div className='w-32 h-6 rounded-lg bg-neutral-04' />
              </div>

              <Icons.more className='text-pink-01 group-hover:text-base-black transition-colors' />
            </div>

            <div className='rounded-xl h-[480px] bg-neutral-04 w-full animate-pulse'></div>
          </div>
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
  const { mutate: deleteTtsProvider } = useDeleteTtsProvider();
  const { mutate: deleteTtsVoice } = useDeleteTtsVoice();
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');

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

  return (
    <>
      <div className='space-y-10 pb-5'>
        {ttsProviders && ttsProviders.length > 0 ? (
          ttsProviders.map((ttsProvider, index) => {
            const enhancedTtsVoices = ttsProvider.ttsVoices.map((voice) => ({
              ...voice,
              providerName: ttsProvider.name,
              providerId: ttsProvider.id,
            }));

            const filteredVoices =
              genderFilter === 'all' ? enhancedTtsVoices : enhancedTtsVoices.filter((voice) => voice.gender === genderFilter);

            return (
              <DataCard.Root key={ttsProvider.id}>
                <DataCard.Label
                  className='text-2xl font-semibold flex gap-2 sm:items-center'
                  extra={
                    <div className='flex items-center gap-6'>
                      {index === 0 && (
                        <Button.Root variant='secondary' size='sm' className='px-2 sm:px-4 gap-2'>
                          <button
                            onClick={() => setGenderFilter(genderFilter === 'Female' ? 'all' : 'Female')}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors ${
                              genderFilter === 'Female' ? 'bg-pink-01 text-white' : 'text-neutral-01 hover:text-base-black'
                            }`}
                          >
                            <div className='flex items-center gap-1 bg-[#FF85B7] py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                              👩🏻
                            </div>
                            <span className='text-body-sm font-medium'>Female</span>
                          </button>
                          <div className='w-px h-4 bg-neutral-03' />
                          <button
                            onClick={() => setGenderFilter(genderFilter === 'Male' ? 'all' : 'Male')}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors ${
                              genderFilter === 'Male' ? 'bg-pink-01 text-white' : 'text-neutral-01 hover:text-base-black'
                            }`}
                          >
                            <div className='flex items-center gap-1 bg-[#069cf3] py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                              🧔🏻‍♂️
                            </div>
                            <span className='text-body-sm font-medium'>Male</span>
                          </button>
                        </Button.Root>
                      )}
                      <div className='hidden items-center gap-2 text-body-sm sm:flex'>
                        <span className='text-base-black font-normal'>$/Character</span>
                        <span className='text-neutral-01 font-normal'>-</span>
                        <span className='font-semibold text-base-black'>${ttsProvider.dollarPerCharacter}</span>
                      </div>
                      <ViewButton
                        popoverItems={[
                          { text: 'Edit TTS Provider', href: `${ROUTES.services}/tts/tts-providers/${ttsProvider.id}/edit` },

                          {
                            text: 'Add TTS Voice',
                            href: `${ROUTES.services}/tts/tts-providers/${ttsProvider.id}/tts-voice/new`,
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
                      <span className='font-semibold text-base-black'>${ttsProvider.dollarPerCharacter}</span>
                    </div>
                  </div>
                </DataCard.Label>
                <DataCard.Wrapper>
                  {enhancedTtsVoices.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2'>
                      {filteredVoices.map((voice) => (
                        <div
                          key={voice.id}
                          className='group flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-neutral-05 transition-colors cursor-pointer'
                        >
                          <div className='flex items-center gap-3 flex-1 min-w-0'>
                            <PlayerButton variant='secondary' audioSrc={PATHS.ttsVoice(voice.id)} />
                            <span className='font-semibold text-body-md flex items-center gap-2 truncate'>
                              <span className='truncate'>{voice.name}</span>
                              {voice.gender === 'Female' ? (
                                <div className='flex items-center gap-1 bg-[#FF85B7] py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold flex-shrink-0'>
                                  👩🏻
                                </div>
                              ) : voice.gender === 'Male' ? (
                                <div className='flex items-center gap-1 bg-[#069cf3] py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold flex-shrink-0'>
                                  🧔🏻‍♂️
                                </div>
                              ) : null}
                              <RecommendedBadge recommended={voice.recommended} tooltipText='Recommended' />
                            </span>
                          </div>
                          <ViewButton
                            popoverItems={[
                              {
                                text: 'Edit',
                                href: `${ROUTES.services}/tts/tts-providers/${voice.providerId}/tts-voices/${voice.id}/edit`,
                              },
                              { text: 'Delete', onClick: () => handleDeleteTtsVoice(voice), isDelete: true },
                            ]}
                            className='flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'
                            isDataCard={true}
                          />
                        </div>
                      ))}
                    </div>
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
