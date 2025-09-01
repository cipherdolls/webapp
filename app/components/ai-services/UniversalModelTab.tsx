import { useMemo, useRef } from 'react';
import { Fragment } from 'react/jsx-runtime';
import type { ChatModel, EmbeddingModel, AiProvider } from '~/types';
import SearchChatModels from '~/components/ui/search-chat-models';
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
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { ROUTES } from '~/constants';

type ModelData = ChatModel | EmbeddingModel;

type UniversalModelTabProps<TData = any> = {
  tabType: 'chat-models' | 'embedding-models' | 'reasoning-models';
  data?: TData;
} & Omit<UseInfiniteQueryResult<TData, Error>, 'data'>;

type ModelWithPossibleChatFields = ModelData & {
  contextWindow?: number;
  aggregateChatCompletions?: { avgTimeTakenMs: number };
};

function ModelSkeleton({ count = 3 }: { count?: number }) {
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

export function UniversalModelTab({ tabType, data, ...queryProps }: UniversalModelTabProps) {
  const [infiniteRef] = useInfiniteScroll({
    loading: queryProps.isFetchingNextPage,
    hasNextPage: queryProps.hasNextPage,
    onLoadMore: queryProps.fetchNextPage,
    disabled: Boolean(queryProps.isFetchingNextPage || queryProps.error),
  });

  const models: ModelData[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    // In case embedding/reasoning returns `{ data: [...] }`
    if (data && Array.isArray((data as any).data)) return (data as any).data;
    return [];
  }, [data]);

  const groupedModels = useMemo(() => {
    const groups: { [providerId: string]: { provider: AiProvider | undefined; models: ModelData[] } } = {};

    models.forEach((model) => {
      const providerId = model?.aiProvider?.id || 'unknown';
      if (!groups[providerId]) {
        groups[providerId] = {
          provider: model?.aiProvider,
          models: [],
        };
      }
      groups[providerId].models.push(model);
    });

    return Object.values(groups);
  }, [models]);

  // Get config based on tab type
  const modelType = tabType === 'chat-models' ? 'Chat model' : tabType === 'embedding-models' ? 'Embedding model' : 'Reasoning model';

  const getRowUrl = (model: ModelData) => {
    let baseUrl;
    switch (tabType) {
      case 'chat-models':
        baseUrl = '/chat-models';
        break;
      case 'embedding-models':
        baseUrl = '/embedding-models';
        break;
      default:
        baseUrl = '/reasoning-models';
        break;
    }
    return `${baseUrl}/${model.id}`;
  };

  const addModelHref = (providerId: string | undefined, providerName: string | undefined) => {
    let baseUrl;
    switch (tabType) {
      case 'chat-models':
        baseUrl = `${ROUTES.services}/ai/chat-models/new`;
        break;
      case 'embedding-models':
        baseUrl = `${ROUTES.services}/ai/embedding-models/new`;
        break;
      default:
        baseUrl = `${ROUTES.services}/ai/reasoning-models/new`;
        break;
    }
    return `${baseUrl}?id=${providerId || ''}&modelName=${providerName || ''}`;
  };


  return (
    <div className='w-full' ref={infiniteRef}>
      {/* Search Section - only for chat models */}
      {tabType === 'chat-models' && (
        <div className='mb-6'>
          <SearchChatModels />
        </div>
      )}

      {/* Results Section */}
      {queryProps.isLoading ? (
        <ModelSkeleton />
      ) : (
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
                          { text: 'Edit AI Provider', href: `${ROUTES.services}/ai/ai-providers/${group.provider?.id}/edit` },
                          {
                            text: `Add ${modelType}`,
                            href: addModelHref(group.provider?.id || '', group.provider?.name || ''),
                          },
                          {
                            text: 'Delete',
                            href: `${ROUTES.services}/ai/providers/delete?id=${group.provider?.id}&modelName=${group.provider?.name}`,
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
                    <div className='flex items-center gap-1'>{group.provider?.name || 'Unknown Provider'}</div>
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
                                    tabType === 'chat-models' || tabType === 'reasoning-models'
                                      ? [
                                          {
                                            label: 'Context Window',
                                            value: `${(model as ModelWithPossibleChatFields).contextWindow?.toLocaleString() || 'N/A'} tokens`,
                                          },
                                          {
                                            label: 'Average Time Taken',
                                            value: `${(model as ModelWithPossibleChatFields).aggregateChatCompletions?.avgTimeTakenMs || '--'} ms`,
                                          },
                                        ]
                                      : [
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

          {queryProps.error && (
            <div className='text-center text-red-500 py-4'>
              <p>Failed to load {tabType.replace('-', tabType)}</p>
            </div>
          )}

          {queryProps.isFetchingNextPage && (
            <div className='text-center py-4'>
              <div className='inline-flex items-center gap-2'>
                <Icons.loading className='size-4 animate-spin' />
                <span className='text-neutral-01'>Loading more {tabType.replace('-', ' ')}...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
