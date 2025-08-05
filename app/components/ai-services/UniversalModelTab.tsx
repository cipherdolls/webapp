import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Fragment } from 'react/jsx-runtime';
import type { ChatModelsPaginated, ChatModel, EmbeddingModel, AiProvider } from '~/types';
import { fetchPaginatedData } from '~/utils/fetchWithAuth';
import SearchChatModels from '~/components/ui/search-chat-models';
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll';
import { Icons } from '~/components/ui/icons';
import { DataCard } from '~/components/DataCard';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { getPicture } from '~/utils/getPicture';
import { RecommendedBadge } from '~/components/ui/RecommendedBadge';
import { formatModelName } from '~/utils/formatModelName';
import Tooltip from '~/components/ui/tooltip';
import { ViewButton } from '~/components/preferencesViewButton';
import Table from '~/components/Table';
import { chatModelColumns, embeddingModelColumns, reasoningModelColumns } from '~/components/ai-services/TableDefinitions';

type ModelData = ChatModel | EmbeddingModel;

type UniversalModelTabProps = {
  tabType: 'chat-models' | 'embedding-models' | 'reasoning-models';
  initialData: {
    data: ModelData[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  } | null;
};

type ModelWithPossibleChatFields = ModelData & {
  contextWindow?: number;
  aggregateChatCompletions?: { avgTimeTakenMs: number };
};

function ModelSkeleton({ count = 3 }: { count?: number }) {
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

export function UniversalModelTab({ tabType, initialData }: UniversalModelTabProps) {
  // ALL TABS CALL THE EXACT SAME HOOKS IN THE SAME ORDER
  const [searchParams] = useSearchParams();
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Initialize loaded state
  useEffect(() => {
    if (initialData) {
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialData]);

  const fetchMoreWithParams = async (page: number) => {
    return fetchPaginatedData<{data: ModelData[], meta: {total: number; page: number; limit: number; totalPages: number}}>(tabType, searchParams, page, 10);
  };

  const infiniteScrollData = useMemo(() => initialData?.data || [], [initialData?.data]);
  const infiniteScrollMeta = useMemo(() => 
    initialData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }, 
    [initialData?.meta]
  );

  const infiniteScroll = useInfiniteScroll({
    initialData: infiniteScrollData,
    initialMeta: infiniteScrollMeta,
    fetchMore: fetchMoreWithParams,
    enabled: hasInitiallyLoaded && !!initialData,
  });

  const filteredModels = useMemo(() => {
    return [...infiniteScroll.data];
  }, [infiniteScroll.data]);

  // Group models by provider - ALWAYS CALLED
  const groupedModels = useMemo(() => {
    const groups: { [providerId: string]: { provider: AiProvider | undefined; models: ModelData[] } } = {};
    
    filteredModels.forEach((model) => {
      const providerId = model?.aiProvider?.id || 'unknown';
      if (!groups[providerId]) {
        groups[providerId] = {
          provider: model?.aiProvider,
          models: []
        };
      }
      groups[providerId].models.push(model);
    });
    
    return Object.values(groups);
  }, [filteredModels]);

  if (!hasInitiallyLoaded || !initialData) {
    return <ModelSkeleton />;
  }

  // Get config based on tab type  
  const modelType = tabType === 'chat-models' ? 'Chat model' : 
                   tabType === 'embedding-models' ? 'Embedding model' : 
                   'Reasoning model';
                   
  const getRowUrl = (model: ModelData) => {
    const baseUrl = tabType === 'chat-models' ? '/chat-models' : 
                   tabType === 'embedding-models' ? '/embedding-models' : 
                   '/reasoning-models';
    return `${baseUrl}/${model.id}`;
  };
  
  const addModelHref = (providerId: string | undefined, providerName: string | undefined) => {
    const baseUrl = tabType === 'chat-models' ? '/services/ai/chat-models/new' : 
                   tabType === 'embedding-models' ? '/services/ai/embedding-models/new' : 
                   '/services/ai/reasoning-models/new';
    return `${baseUrl}?id=${providerId || ''}&modelName=${providerName || ''}`;
  };

  return (
    <div className='w-full'>
      {/* Search Section - only for chat models */}
      {tabType === 'chat-models' && (
        <div className='mb-6'>
          <SearchChatModels />
        </div>
      )}

      {/* Results Section */}
      <div className='flex flex-col gap-10 pb-5'>
        {groupedModels.length === 0 ? (
          <p className='text-body-md text-neutral-01 text-center'>No {tabType.replace('-', ' ')} found.</p>
        ) : (
          groupedModels.map((group) => (
            <div key={group.provider?.id || 'unknown'} className='flex flex-col gap-5'>
              <DataCard.Root>
                <DataCard.Label
                  className='text-2xl font-semibold flex items-center gap-2'
                  extra={
                    <ViewButton
                      popoverItems={[
                        { text: 'Edit AI Provider', href: `/services/ai/ai-providers/${group.provider?.id}/edit` },
                        {
                          text: `Add ${modelType}`,
                          href: addModelHref(group.provider?.id || '', group.provider?.name || ''),
                        },
                        {
                          text: 'Delete',
                          href: `/services/ai/providers/delete?id=${group.provider?.id}&modelName=${group.provider?.name}`,
                          isDelete: true,
                        },
                      ]}
                    />
                  }
                >
                  <div className='size-6'>
                    <img
                      src={getPicture(group.provider, 'ai-providers', false)}
                      srcSet={getPicture(group.provider, 'ai-providers', true)}
                      alt={group.provider?.name || 'Provider'}
                      className='size-full object-cover rounded-lg'
                    />
                  </div>
                  <div className='flex items-center gap-1'>
                    {group.provider?.name || 'Unknown Provider'}
                  </div>
                </DataCard.Label>

                <div className='bg-gradient-1 rounded-xl md:bg-none'>
                  <div className='flex items-center justify-between p-3 md:hidden'>
                    <span className='text-xs text-neutral-01 font-semibold'>{modelType}</span>
                  </div>

                  <DataCard.Wrapper>
                    {/* DESKTOP TABLE */}
                    <div className='md:block hidden'>
                      {tabType === 'chat-models' && (
                        <Table
                          columns={chatModelColumns}
                          data={group.models as ChatModel[]}
                          getRowUrl={(model) => `/chat-models/${model.id}`}
                        />
                      )}
                      {tabType === 'embedding-models' && (
                        <Table
                          columns={embeddingModelColumns}
                          data={group.models as EmbeddingModel[]}
                          getRowUrl={(model) => `/embedding-models/${model.id}`}
                        />
                      )}
                      {tabType === 'reasoning-models' && (
                        <Table
                          columns={reasoningModelColumns}
                          data={group.models as ChatModel[]}
                          getRowUrl={(model) => `/reasoning-models/${model.id}`}
                        />
                      )}
                    </div>

                    {/* MOBILE CARD */}
                    <div className='block md:hidden'>
                      {group.models.map((model, index) => (
                        <Fragment key={model.id}>
                          <DataCard.Item collapsible href={getRowUrl(model)}>
                            <DataCard.ItemLabel>
                              <span className='flex items-center gap-2'>
                                {model.error && (
                                  <Tooltip
                                    side={'top'}
                                    trigger={<Icons.warning className='size-4 text-specials-danger' />}
                                    content={model.error}
                                    popoverClassName='max-w-[350px]'
                                  />
                                )}
                                {formatModelName(model.providerModelName)}
                                <RecommendedBadge recommended={model.recommended} tooltipText='Recommended' />
                              </span>
                            </DataCard.ItemLabel>
                            <DataCard.ItemCollapsibleContent>
                              <DataCard.ItemDataGrid
                                data={
                                  tabType === 'chat-models' || tabType === 'reasoning-models' ? [
                                    {
                                      label: 'Context Window',
                                      value: `${(model as ModelWithPossibleChatFields).contextWindow?.toLocaleString() || 'N/A'} tokens`,
                                    },
                                    {
                                      label: 'Average Time Taken',
                                      value: `${(model as ModelWithPossibleChatFields).aggregateChatCompletions?.avgTimeTakenMs || '--'} ms`,
                                    },
                                  ] : [
                                    {
                                      label: 'Output',
                                      value: `$${scientificNumConvert(model.dollarPerOutputToken * 1000000)}`,
                                    },
                                  ]
                                }
                                variant='secondary'
                              />
                            </DataCard.ItemCollapsibleContent>
                            <DataCard.ItemDataGrid
                              data={[
                                {
                                  label: '$/Input',
                                  value: `$${scientificNumConvert(model.dollarPerInputToken * 1000000)}`,
                                },
                                {
                                  label: '$/Output',
                                  value: `$${scientificNumConvert(model.dollarPerOutputToken * 1000000)}`,
                                },
                              ]}
                            />
                          </DataCard.Item>
                          {group.models.length - 1 !== index && <DataCard.Divider />}
                        </Fragment>
                      ))}
                    </div>
                  </DataCard.Wrapper>
                </div>
              </DataCard.Root>
            </div>
          ))
        )}

        {infiniteScroll.error && (
          <div className='text-center text-red-500 py-4'>
            <p>Failed to load {tabType.replace('-', ' ')}: {infiniteScroll.error}</p>
          </div>
        )}

        {infiniteScroll.loading && (
          <div className='text-center py-4'>
            <div className='inline-flex items-center gap-2'>
              <Icons.loading className='size-4 animate-spin' />
              <span className='text-neutral-01'>Loading more {tabType.replace('-', ' ')}...</span>
            </div>
          </div>
        )}

        {infiniteScroll.hasMore && !infiniteScroll.loading && <div ref={infiniteScroll.triggerRef} className='h-4' />}
      </div>
    </div>
  );
}