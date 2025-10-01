import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { DataCard } from '~/components/DataCard';
import { chatModelColumns, embeddingModelColumns, reasoningModelColumns } from '~/components/ai-services/TableDefinitions';
import { Fragment } from 'react';
import { ViewButton } from '~/components/preferencesViewButton';
import { getPicture } from '~/utils/getPicture';
import { RecommendedBadge } from '~/components/ui/RecommendedBadge';
import { InformationBadge } from '~/components/ui/InformationBadge';
import { formatModelName } from '~/utils/formatModelName';
import Tooltip from '~/components/ui/tooltip';
import { Icons } from '~/components/ui/icons';
import Table from '~/components/Table';
import { useInfiniteAiProviders } from '~/hooks/queries/aiProviderQueries';
import SearchAiProviders from '~/components/ui/search-ai-providers';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { useSearchParams } from 'react-router';
import { useDeleteAiProvider } from '~/hooks/queries/aiProviderMutations';
import { useConfirm } from '~/providers/AlertDialogProvider';
import type { AiProvider } from '~/types';
import { ROUTES } from '~/constants';
import { useUser } from '~/hooks/queries/userQueries';

function AiProviderSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-10 pb-5'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-3'>
            <div className='flex justify-between items-center mb-1'>
              <div className='flex gap-2 items-center'>
                <div className='w-6 h-6 rounded-lg bg-neutral-04'/>
                <div className='w-32 h-6 rounded-lg bg-neutral-04'/>
              </div>

              <Icons.more className='text-pink-01 group-hover:text-base-black transition-colors' />
            </div>

            <div className='rounded-xl h-[110px] bg-neutral-04 w-full animate-pulse'></div>
            <div className='rounded-xl h-[110px] bg-neutral-04 w-full animate-pulse'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

const AiProvidersTab = () => {
  const confirm = useConfirm();
  const [searchParams] = useSearchParams();
  const searchName = searchParams.get('name') || '';

  const {data: user, isLoading: isUserLoading } = useUser()
  const { mutate: deleteAiProvider, isPending: isDeletingAiProvider } = useDeleteAiProvider();
  const {
    data: aiProvidersData,
    error: aiProvidersError,
    isLoading: aiProvidersLoading,
    hasNextPage: aiProvidersHasNextPage,
    fetchNextPage: aiProvidersFetchNextPage,
  } = useInfiniteAiProviders({ name: searchName });

  const isAdmin = user?.role === 'ADMIN'
  const aiProviders = aiProvidersData?.pages.flatMap((page) => page.data) || [];

  // Filter to show data without errors for default users
  function filteredAiProvidersWithoutErrors(aiProviders: AiProvider[]): AiProvider[] {
    return aiProviders.map((aiProvider) => ({
      ...aiProvider,
      chatModels: aiProvider.chatModels.filter((chatModel) => !chatModel.error),
      embeddingModels: aiProvider.embeddingModels.filter((embeddingModel) => !embeddingModel.error),
      reasoningModels: aiProvider.reasoningModels.filter((reasoningModel) => !reasoningModel.error),
    }))
  }

  const filteredAiProviders = isAdmin ? aiProviders : filteredAiProvidersWithoutErrors(aiProviders)

  const [infiniteRef] = useInfiniteScroll({
    loading: aiProvidersLoading,
    hasNextPage: aiProvidersHasNextPage,
    onLoadMore: aiProvidersFetchNextPage,
    disabled: Boolean(aiProvidersError),
  });


  const handleDeleteAiProvider = async (aiProvider: AiProvider) => {
    const confirmResult = await confirm({
      title: `Delete provider ${aiProvider.name}?`,
      body: 'By deleting an AI provider all related data will be deleted as well. You will not be able to restore the data.',
      actionButton: 'Yes, Delete',
      cancelButton: 'No, Leave',
    });

    if (!confirmResult) return
    deleteAiProvider(aiProvider.id);
  };


  return (
    <div className='flex flex-col gap-10 pb-5' ref={infiniteRef}>
      <SearchAiProviders />
      {aiProvidersLoading ? (
        <AiProviderSkeleton />
      ) : aiProviders.length === 0 ? (
        <p className='text-body-md text-neutral-01 text-center'>No AI providers found.</p>
      ) : (
        filteredAiProviders.map((aiProvider) => {
          return (
            <div key={aiProvider.id} className='flex flex-col gap-5'>
              <DataCard.Root>
                <DataCard.Label
                  className='text-2xl font-semibold flex items-center gap-2'
                  extra={
                    <ViewButton
                      popoverItems={[
                        { text: 'Edit AI Provider', href: `${ROUTES.services}/ai/ai-providers/${aiProvider.id}/edit` },
                        {
                          text: 'Add Chat Model',
                          href: `${ROUTES.services}/ai/chat-models/new?id=${aiProvider.id}&modelName=${aiProvider.name}`,
                        },
                        {
                          text: 'Add Embedding Model',
                          href: `${ROUTES.services}/ai/embedding-models/new?id=${aiProvider.id}&modelName=${aiProvider.name}`,
                        },
                        {
                          text: 'Add Reasoning Model',
                          href: `${ROUTES.services}/ai/reasoning-models/new?id=${aiProvider.id}&modelName=${aiProvider.name}`,
                        },
                        {
                          text: 'Delete',
                          onClick: () => handleDeleteAiProvider(aiProvider),
                          isDelete: true,
                        },
                      ]}
                    />
                  }
                >
                  <div className='size-6'>
                    <img
                      src={getPicture(aiProvider, 'ai-providers', false)}
                      srcSet={getPicture(aiProvider, 'ai-providers', true)}
                      alt={aiProvider.name}
                      className='size-full object-cover rounded-lg'
                    />
                  </div>
                  <div className='flex items-center gap-1'>
                    {aiProvider.name}
                    <InformationBadge
                      tooltipText='High-speed AI for real-time apps and chatbots'
                      side={{
                        default: 'top',
                        lg: 'right',
                      }}
                    />
                  </div>
                </DataCard.Label>

                {/* CHAT MODELS WRAPPER */}
                <div className='bg-gradient-1 rounded-xl md:bg-none'>
                  {aiProvider.chatModels.length > 0 && (
                    <>
                      <div className='flex items-center justify-between p-3 md:hidden'>
                        <span className='text-xs text-neutral-01 font-semibold'>Chat model</span>
                        <InformationBadge
                          tooltipText='Chat model'
                          side={{
                            default: 'top',
                            lg: 'right',
                          }}
                        />
                      </div>

                      <DataCard.Wrapper>
                        {/* DESKTOP TABLE */}
                        <div className='md:block hidden'>
                          <Table
                            columns={chatModelColumns}
                            data={aiProvider.chatModels}
                            getRowUrl={(chatModel) => `/chat-models/${chatModel.id}`}
                          />
                        </div>

                        {/* MOBILE CARD */}
                        <div className='block md:hidden'>
                          {aiProvider.chatModels.map((chatModel, index) => {
                            return (
                              <Fragment key={chatModel.id}>
                                <DataCard.Item collapsible href={`/chat-models/${chatModel.id}`}>
                                  <DataCard.ItemLabel>
                                    <span className='flex items-center gap-2'>
                                      {chatModel.providerModelName}
                                      <RecommendedBadge recommended={chatModel.recommended} tooltipText='Recommended' />
                                    </span>
                                  </DataCard.ItemLabel>
                                  <DataCard.ItemCollapsibleContent>
                                    <DataCard.ItemDataGrid
                                      data={[
                                        {
                                          label: 'Output',
                                          value: <>{scientificNumConvert(chatModel.dollarPerInputToken)}</>,
                                        },
                                        {
                                          label: 'Average Time Taken',
                                          value: '1153 ms',
                                        },
                                      ]}
                                      variant='secondary'
                                    />
                                  </DataCard.ItemCollapsibleContent>
                                  <DataCard.ItemDataGrid
                                    data={[
                                      {
                                        label: '$/Input',
                                        value: <>${scientificNumConvert(chatModel.dollarPerInputToken  * 1000000)}</>,
                                      },
                                      {
                                        label: '$/Output',
                                        value: <>${scientificNumConvert(chatModel.dollarPerOutputToken  * 1000000)}</>,
                                      },
                                    ]}
                                  />
                                </DataCard.Item>
                                {aiProvider.chatModels.length - 1 !== index && <DataCard.Divider />}
                              </Fragment>
                            );
                          })}
                        </div>
                      </DataCard.Wrapper>
                    </>
                  )}

                  {/* EMBEDDING MODELS WRAPPER */}
                  {aiProvider.embeddingModels.length > 0 && (
                    <>
                      <div className='flex items-center justify-between px-3 pt-3 md:hidden'>
                        <span className='text-xs text-neutral-01 font-semibold'>Embedding model</span>
                        <Tooltip
                          side='top'
                          trigger={<Icons.info className='text-neutral-02 inline-block size-4' />}
                          content={'Embedding model'}
                        />
                      </div>

                      <DataCard.Wrapper className='mt-3'>
                        {/* DESKTOP TABLE */}
                        <div className='md:block hidden'>
                          <Table
                            columns={embeddingModelColumns}
                            data={aiProvider.embeddingModels}
                            getRowUrl={(embeddingModel) => `/embedding-models/${embeddingModel.id}`}
                          />
                        </div>
                        {/* MOBILE CARD */}
                        <div className='block md:hidden'>
                          {aiProvider.embeddingModels.map((embeddingModel, index) => {
                            return (
                              <Fragment key={embeddingModel.id}>
                                <DataCard.Item collapsible href={`/embedding-models/${embeddingModel.id}`}>
                                  <DataCard.ItemLabel>
                                    <span className='flex items-center gap-2'>
                                      {formatModelName(embeddingModel.providerModelName)}
                                      <RecommendedBadge recommended={embeddingModel.recommended} tooltipText='Recommended' />
                                    </span>
                                  </DataCard.ItemLabel>
                                  <DataCard.ItemCollapsibleContent>
                                    <DataCard.ItemDataGrid
                                      data={[
                                        {
                                          label: 'Output',
                                          value: <>{scientificNumConvert(embeddingModel.dollarPerInputToken)}</>,
                                        },
                                      ]}
                                      variant='secondary'
                                    />
                                  </DataCard.ItemCollapsibleContent>
                                  <DataCard.ItemDataGrid
                                    data={[
                                      {
                                        label: '$/Input',
                                        value: <>${scientificNumConvert(embeddingModel.dollarPerInputToken  * 1000000)}</>,
                                      },
                                      {
                                        label: '$/Output',
                                        value: <>${scientificNumConvert(embeddingModel.dollarPerOutputToken  * 1000000)}</>,
                                      },
                                    ]}
                                  />
                                </DataCard.Item>
                                {aiProvider.embeddingModels.length - 1 !== index && <DataCard.Divider />}
                              </Fragment>
                            );
                          })}
                        </div>
                      </DataCard.Wrapper>
                    </>
                  )}

                  {/* REASONING MODELS WRAPPER */}
                  {aiProvider.reasoningModels && aiProvider.reasoningModels.length > 0 && (
                    <>
                      <div className='flex items-center justify-between px-3 pt-3 md:hidden'>
                        <span className='text-xs text-neutral-01 font-semibold'>Reasoning model</span>
                        <Tooltip
                          side='top'
                          trigger={<Icons.info className='text-neutral-02 inline-block size-4' />}
                          content={'Reasoning model'}
                        />
                      </div>

                      <DataCard.Wrapper className='mt-3'>
                        {/* DESKTOP TABLE */}
                        <div className='md:block hidden'>
                          <Table
                            columns={reasoningModelColumns}
                            data={aiProvider.reasoningModels}
                            getRowUrl={(reasoningModel) => `/reasoning-models/${reasoningModel.id}`}
                          />
                        </div>

                        {/* MOBILE CARD */}
                        <div className='block md:hidden'>
                          {aiProvider.reasoningModels.map((reasoningModel, index) => {
                            return (
                              <Fragment key={reasoningModel.id}>
                                <DataCard.Item collapsible href={`/reasoning-models/${reasoningModel.id}`}>
                                  <DataCard.ItemLabel>
                                    <span className='flex items-center gap-2'>
                                      {reasoningModel.providerModelName}
                                      <RecommendedBadge recommended={reasoningModel.recommended} tooltipText='Recommended' />
                                    </span>
                                  </DataCard.ItemLabel>
                                  <DataCard.ItemCollapsibleContent>
                                    <DataCard.ItemDataGrid
                                      data={[
                                        {
                                          label: 'Output',
                                          value: <>{scientificNumConvert(reasoningModel.dollarPerInputToken)}</>,
                                        },
                                        {
                                          label: 'Average Time Taken',
                                          value: '1153 ms',
                                        },
                                      ]}
                                      variant='secondary'
                                    />
                                  </DataCard.ItemCollapsibleContent>
                                  <DataCard.ItemDataGrid
                                    data={[
                                      {
                                        label: '$/Input',
                                        value: <>${scientificNumConvert(reasoningModel.dollarPerInputToken * 1000000)}</>,
                                      },
                                      {
                                        label: '$/Output',
                                        value: <>${scientificNumConvert(reasoningModel.dollarPerOutputToken * 1000000)}</>,
                                      },
                                    ]}
                                  />
                                </DataCard.Item>
                                {aiProvider.reasoningModels.length - 1 !== index && <DataCard.Divider />}
                              </Fragment>
                            );
                          })}
                        </div>
                      </DataCard.Wrapper>
                    </>
                  )}
                </div>

                {/* Show message if no models */}
                {aiProvider.chatModels.length === 0 &&
                  aiProvider.embeddingModels.length === 0 &&
                  (!aiProvider.reasoningModels || aiProvider.reasoningModels.length === 0) && (
                    <DataCard.Wrapper>
                      <DataCard.Text>No models found</DataCard.Text>
                    </DataCard.Wrapper>
                  )}
              </DataCard.Root>
            </div>
          );
        })
      )}

      {aiProvidersError && (
        <div className='text-center text-red-500 py-4'>
          <p>Failed to load AI providers</p>
        </div>
      )}

      {aiProvidersLoading && (
        <div className='text-center py-4'>
          <div className='inline-flex items-center gap-2'>
            <Icons.loading className='size-4 animate-spin' />
            <span className='text-neutral-01'>Loading more AI providers...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiProvidersTab;
