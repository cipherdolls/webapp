import { Outlet, useNavigate, useSearchParams } from 'react-router';
import { useEffect, useState } from 'react';
import type { AiProvidersPaginated, ChatModelsPaginated } from '~/types';
import { ModelTabs, type EmbeddingModelsPaginated, type ReasoningModelsPaginated } from '~/components/ai-services/ModelTabs';
import type { Route } from './+types/_main._general.services.ai';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { DataCard } from '~/components/DataCard';
import { chatModelColumns, embeddingModelColumns, reasoningModelColumns } from '~/components/ai-services/TableDefinitions';
import { Fragment } from 'react/jsx-runtime';
import { fetchPaginatedData } from '~/utils/fetchWithAuth';
import { ViewButton } from '~/components/preferencesViewButton';
import { getPicture } from '~/utils/getPicture';
import { RecommendedBadge } from '~/components/ui/RecommendedBadge';
import { InformationBadge } from '~/components/ui/InformationBadge';
import { formatModelName } from '~/utils/formatModelName';
import Tooltip from '~/components/ui/tooltip';
import { Icons } from '~/components/ui/icons';
import SearchAiProviders from '~/components/ui/search-ai-providers';
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll';
import { AiServicesTabs } from '~/components/ai-services/AiServicesTabs';
import Table from '~/components/Table';

function AiProviderSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-10 pb-5'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='flex flex-col gap-4'>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full max-w-[200px] animate-pulse'></div>
          <div className='flex flex-col gap-3'>
            <div className='rounded-[10px] h-[110px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[110px] bg-gradient-1 w-full animate-pulse'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'AI Services' }];
}

export async function clientLoader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const viewMode = searchParams.get('view') || 'providers';
  const activeTab = searchParams.get('tab') || 'chat-models';

  // Always fetch AI providers for the providers view
  const aiProvidersPaginated = await fetchPaginatedData<AiProvidersPaginated>('ai-providers', searchParams, 1, 10);

  // Fetch model data based on current tab when in models view
  let chatModelsPaginated: ChatModelsPaginated | null = null;
  let embeddingModelsPaginated: EmbeddingModelsPaginated | null = null;
  let reasoningModelsPaginated: ReasoningModelsPaginated | null = null;

  if (viewMode === 'models') {
    try {
      if (activeTab === 'chat-models') {
        chatModelsPaginated = await fetchPaginatedData<ChatModelsPaginated>('chat-models', searchParams, 1, 10);
      } else if (activeTab === 'embedding-models') {
        const embeddingResult = await fetchPaginatedData<EmbeddingModelsPaginated>('embedding-models', searchParams, 1, 10);
        
        // Handle case where API returns array directly instead of paginated format
        embeddingModelsPaginated = Array.isArray(embeddingResult) ? {
          data: embeddingResult,
          meta: { total: embeddingResult.length, page: 1, limit: embeddingResult.length, totalPages: 1 }
        } : embeddingResult;
      } else if (activeTab === 'reasoning-models') {
        const reasoningResult = await fetchPaginatedData<ReasoningModelsPaginated>('reasoning-models', searchParams, 1, 10);
        
        // Handle case where API returns array directly instead of paginated format
        reasoningModelsPaginated = Array.isArray(reasoningResult) ? {
          data: reasoningResult,
          meta: { total: reasoningResult.length, page: 1, limit: reasoningResult.length, totalPages: 1 }
        } : reasoningResult;
      }
    } catch (error) {
      console.error('Error fetching model data:', error);
      // Return empty data structure on error to prevent crashes
      if (activeTab === 'chat-models') {
        chatModelsPaginated = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } };
      } else if (activeTab === 'embedding-models') {
        embeddingModelsPaginated = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } };
      } else if (activeTab === 'reasoning-models') {
        reasoningModelsPaginated = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } };
      }
    }
  }

  return {
    aiProvidersPaginated,
    chatModelsPaginated,
    embeddingModelsPaginated,
    reasoningModelsPaginated,
    searchParams: Object.fromEntries(searchParams.entries()),
  };
}

export default function AiServicesIndex({ loaderData }: Route.ComponentProps) {
  const {
    aiProvidersPaginated,
    chatModelsPaginated,
    embeddingModelsPaginated,
    reasoningModelsPaginated,
    searchParams: initialSearchParams,
  } = loaderData;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Get view mode from URL - 'providers' (default) or 'models'
  const viewMode = searchParams.get('view') || 'providers';
  const activeTab = searchParams.get('tab') || 'chat-models';


  const providersSearchQuery = searchParams.get('name') || '';

  // Active filters depend on the current view mode  
  const providersHasActiveFilters = providersSearchQuery.length > 0;

  const fetchMoreWithParams = async (page: number) => {
    const currentSearchParams = new URLSearchParams(initialSearchParams);

    // Override with any current URL changes (like search input)
    for (const [key, value] of searchParams.entries()) {
      currentSearchParams.set(key, value);
    }

    return fetchPaginatedData<AiProvidersPaginated>('ai-providers', currentSearchParams, page, 10);
  };

  const infiniteScroll = useInfiniteScroll({
    initialData: aiProvidersPaginated.data,
    initialMeta: aiProvidersPaginated.meta,
    fetchMore: fetchMoreWithParams,
    enabled: hasInitiallyLoaded,
  });


  const handleViewModeChange = (mode: 'providers' | 'models') => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', mode);
    if (mode === 'models' && !newSearchParams.has('tab')) {
      newSearchParams.set('tab', 'chat-models');
    }
    navigate(`/services/ai?${newSearchParams.toString()}`, { replace: true });
  };

  // Remove unnecessary memoization - just use the data directly

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS

  const tabs = ModelTabs({ 
    chatModelsPaginated, 
    embeddingModelsPaginated, 
    reasoningModelsPaginated 
  });

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
        <AiProviderSkeleton />
        <Outlet />
      </>
    );
  }

  return (
    <>
      <div className='w-full'>
        <div className='flex items-center justify-between sm:mt-8 mb-6'>
          <h2 className='text-2xl font-semibold'>AI Services</h2>

          {/* View Mode Toggle */}
          <div className='flex items-center gap-2 bg-neutral-05 rounded-lg p-1'>
            <button
              onClick={() => handleViewModeChange('providers')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'providers' ? 'bg-white text-base-black shadow-sm' : 'text-neutral-01 hover:text-base-black'
              }`}
            >
              By Providers
            </button>
            <button
              onClick={() => handleViewModeChange('models')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'models' ? 'bg-white text-base-black shadow-sm' : 'text-neutral-01 hover:text-base-black'
              }`}
            >
              By Models
            </button>
          </div>
        </div>

        {/* Secondary Navigation - Tabs for Models or Search for Providers */}
        <div className='mb-6'>
          {viewMode === 'models' ? (
            <AiServicesTabs tabs={tabs} defaultTab={activeTab} />
          ) : (
            <div className='flex flex-col gap-5'>
              <SearchAiProviders />

              {providersHasActiveFilters && (
                <div className='flex items-center justify-end'>
                  <button
                    onClick={() => navigate('/services/ai', { replace: true })}
                    className='flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer navigation-exclude text-red-600 hover:bg-red-50'
                  >
                    <Icons.close className='size-4' />
                    <p className='text-body-md font-medium'>Clear filters</p>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Area */}
        {viewMode === 'providers' && (
          <div className='flex flex-col gap-10 pb-5'>
            {infiniteScroll.data.length === 0 ? (
              <p className='text-body-md text-neutral-01 text-center'>No AI providers found.</p>
            ) : (
              infiniteScroll.data.map((aiProvider) => {
                return (
                  <div key={aiProvider.id} className='flex flex-col gap-5'>
                    <DataCard.Root>
                      <DataCard.Label
                        className='text-2xl font-semibold flex items-center gap-2'
                        extra={
                          <ViewButton
                            popoverItems={[
                              { text: 'Edit AI Provider', href: `/services/ai/ai-providers/${aiProvider.id}/edit` },
                              {
                                text: 'Add Chat Model',
                                href: `/services/ai/chat-models/new?id=${aiProvider.id}&modelName=${aiProvider.name}`,
                              },
                              {
                                text: 'Add Embedding Model',
                                href: `/services/ai/embedding-models/new?id=${aiProvider.id}&modelName=${aiProvider.name}`,
                              },
                              {
                                text: 'Add Reasoning Model',
                                href: `/services/ai/reasoning-models/new?id=${aiProvider.id}&modelName=${aiProvider.name}`,
                              },
                              {
                                text: 'Delete',
                                href: `/services/ai/providers/delete?id=${aiProvider.id}&modelName=${aiProvider.name}`,
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
                                              value: <>${scientificNumConvert(chatModel.dollarPerInputToken)}</>,
                                            },
                                            {
                                              label: '$/Output',
                                              value: <>${scientificNumConvert(chatModel.dollarPerOutputToken)}</>,
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
                                              value: <>${scientificNumConvert(embeddingModel.dollarPerInputToken)}</>,
                                            },
                                            {
                                              label: '$/Output',
                                              value: <>${scientificNumConvert(embeddingModel.dollarPerOutputToken)}</>,
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
                                              value: <>${scientificNumConvert(reasoningModel.dollarPerInputToken)}</>,
                                            },
                                            {
                                              label: '$/Output',
                                              value: <>${scientificNumConvert(reasoningModel.dollarPerOutputToken)}</>,
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

            {infiniteScroll.error && (
              <div className='text-center text-red-500 py-4'>
                <p>Failed to load AI providers: {infiniteScroll.error}</p>
              </div>
            )}

            {infiniteScroll.loading && (
              <div className='text-center py-4'>
                <div className='inline-flex items-center gap-2'>
                  <Icons.loading className='size-4 animate-spin' />
                  <span className='text-neutral-01'>Loading more AI providers...</span>
                </div>
              </div>
            )}

            {infiniteScroll.hasMore && !infiniteScroll.loading && <div ref={infiniteScroll.triggerRef} className='h-4' />}
          </div>
        )}
      </div>
      <Outlet />
    </>
  );
}
