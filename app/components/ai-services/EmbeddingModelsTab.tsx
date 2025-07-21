import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import * as Accordion from '@radix-ui/react-accordion';
import type { EmbeddingModel } from '~/types';
import { fetchPaginatedData } from '~/utils/fetchWithAuth';
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll';
import { Icons } from '~/components/ui/icons';
import { formatModelName } from '~/utils/formatModelName';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { RecommendedBadge } from '~/components/ui/RecommendedBadge';
import { getPicture } from '~/utils/getPicture';
import * as Button from '~/components/ui/button/button';
import Tooltip from '~/components/ui/tooltip';

type EmbeddingModelsPaginated = {
  data: EmbeddingModel[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function EmbeddingModelSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='bg-white rounded-xl shadow-bottom-level-1 overflow-hidden'>
          <div className='p-5'>
            <div className='flex items-center gap-3 flex-1'>
              {/* Provider Icon Skeleton */}
              <div className='size-8 bg-gradient-1 rounded-lg animate-pulse flex-shrink-0'></div>
              
              {/* Model Info Skeleton */}
              <div className='flex flex-col flex-1 min-w-0 gap-1'>
                <div className='h-5 bg-gradient-1 rounded w-48 animate-pulse'></div>
                <div className='h-4 bg-gradient-1 rounded w-24 animate-pulse'></div>
              </div>
              
              {/* Quick Stats Skeleton */}
              <div className='hidden sm:flex items-center gap-6'>
                <div className='text-center space-y-1'>
                  <div className='h-4 bg-gradient-1 rounded w-12 animate-pulse'></div>
                  <div className='h-3 bg-gradient-1 rounded w-8 animate-pulse'></div>
                </div>
                <div className='text-center space-y-1'>
                  <div className='h-4 bg-gradient-1 rounded w-12 animate-pulse'></div>
                  <div className='h-3 bg-gradient-1 rounded w-8 animate-pulse'></div>
                </div>
              </div>
              
              {/* Chevron Skeleton */}
              <div className='size-5 bg-gradient-1 rounded animate-pulse flex-shrink-0 ml-2'></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmbeddingModelItem({ embeddingModel }: { embeddingModel: EmbeddingModel }) {
  return (
    <Accordion.Item
      value={embeddingModel.id}
      className='bg-white rounded-xl shadow-bottom-level-1 overflow-hidden'
    >
      <div className='relative'>
        <Accordion.Trigger className='group flex w-full items-center justify-between p-5 text-left hover:bg-neutral-05 transition-colors'>
          <div className='flex items-center gap-3 flex-1'>
            {/* Provider Icon */}
            {embeddingModel.aiProvider && (
              <div className='size-8 flex-shrink-0'>
                <img
                  src={getPicture(embeddingModel.aiProvider, 'ai-providers', false)}
                  alt={embeddingModel.aiProvider.name}
                  className='size-full object-cover rounded-lg'
                  loading='lazy'
                />
              </div>
            )}

            {/* Model Info */}
            <div className='flex flex-col flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                {embeddingModel.error && (
                  <Tooltip
                    side={'top'}
                    trigger={<Icons.warning className='size-4 text-specials-danger flex-shrink-0' />}
                    content={embeddingModel.error}
                    popoverClassName='max-w-[350px]'
                  />
                )}
                <span className='font-semibold text-lg text-base-black truncate'>{formatModelName(embeddingModel.providerModelName)}</span>
                <RecommendedBadge recommended={embeddingModel.recommended} tooltipText='Recommended' />
              </div>

              {embeddingModel.aiProvider && <span className='text-sm text-neutral-01'>{embeddingModel.aiProvider.name}</span>}
            </div>

            {/* Quick Stats */}
            <div className='hidden sm:flex items-center gap-6 text-sm text-neutral-01'>
              <div className='text-center'>
                <div className='font-medium text-base-black'>${scientificNumConvert(embeddingModel.dollarPerInputToken * 1000000)}</div>
                <div>Input</div>
              </div>
              <div className='text-center'>
                <div className='font-medium text-base-black'>${scientificNumConvert(embeddingModel.dollarPerOutputToken * 1000000)}</div>
                <div>Output</div>
              </div>
            </div>
          </div>

          <Icons.chevronDown className='size-5 text-neutral-01 transition-transform duration-200 group-data-[state=open]:rotate-180 ml-2 flex-shrink-0' />
        </Accordion.Trigger>
      </div>
      
      <Accordion.Content className='overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up'>
        <div className='px-5 pb-5'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-04'>
            <div className='space-y-1'>
              <label className='text-sm font-medium text-neutral-01'>Input Cost</label>
              <div className='text-base font-semibold text-base-black'>
                ${scientificNumConvert(embeddingModel.dollarPerInputToken * 1000000)}/1M tokens
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-neutral-01'>Output Cost</label>
              <div className='text-base font-semibold text-base-black'>
                ${scientificNumConvert(embeddingModel.dollarPerOutputToken * 1000000)}/1M tokens
              </div>
            </div>

            {embeddingModel.info && (
              <div className='space-y-1 sm:col-span-2'>
                <label className='text-sm font-medium text-neutral-01'>Additional Info</label>
                <div className='text-sm text-base-black bg-neutral-05 p-3 rounded-lg'>{embeddingModel.info}</div>
              </div>
            )}

            <div className='space-y-1 sm:col-span-2'>
              <label className='text-sm font-medium text-neutral-01'>Features</label>
              <div className='flex flex-wrap gap-2'>
                {embeddingModel.recommended && (
                  <span className='px-2 py-1 bg-gradient-1 text-base-black text-xs font-medium rounded-full'>Recommended</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className='sm:col-span-2 pt-4 border-t border-neutral-04'>
              <div className='flex gap-3'>
                <Button.Root variant='primary' size='sm' className='px-4'>
                  Edit
                </Button.Root>
                <Button.Root variant='danger' size='sm' className='px-4'>
                  <Button.Icon as={Icons.trash} />
                  Delete
                </Button.Root>
              </div>
            </div>
          </div>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

type EmbeddingModelsTabProps = {
  initialData: EmbeddingModelsPaginated | null;
};

export function EmbeddingModelsTab({ initialData }: EmbeddingModelsTabProps) {
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

  const infiniteScrollData = useMemo(() => initialData?.data || [], [initialData?.data]);
  const infiniteScrollMeta = useMemo(() => 
    initialData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }, 
    [initialData?.meta]
  );

  const fetchMoreWithParams = async (page: number) => {
    return fetchPaginatedData<EmbeddingModelsPaginated>('embedding-models', searchParams, page, 10);
  };

  const infiniteScroll = useInfiniteScroll({
    initialData: infiniteScrollData,
    initialMeta: infiniteScrollMeta,
    fetchMore: fetchMoreWithParams,
    enabled: hasInitiallyLoaded && !!initialData && infiniteScrollMeta.totalPages > 1,
  });

  const filteredEmbeddingModels = useMemo(() => {
    return [...infiniteScroll.data];
  }, [infiniteScroll.data]);

  if (!hasInitiallyLoaded || !initialData) {
    return <EmbeddingModelSkeleton />;
  }

  return (
    <div className='w-full'>
      {/* Results Section */}
      <div className='pb-5'>
        {filteredEmbeddingModels.length === 0 ? (
          <p className='text-body-md text-neutral-01 text-center'>No embedding models found.</p>
        ) : (
          <Accordion.Root type='multiple' className='space-y-3'>
            {filteredEmbeddingModels.map((embeddingModel) => (
              <EmbeddingModelItem key={embeddingModel.id} embeddingModel={embeddingModel} />
            ))}
          </Accordion.Root>
        )}

        {infiniteScroll.error && (
          <div className='text-center text-red-500 py-4'>
            <p>Failed to load embedding models: {infiniteScroll.error}</p>
          </div>
        )}

        {infiniteScroll.loading && (
          <div className='text-center py-4'>
            <div className='inline-flex items-center gap-2'>
              <Icons.loading className='size-4 animate-spin' />
              <span className='text-neutral-01'>Loading more embedding models...</span>
            </div>
          </div>
        )}

        {infiniteScroll.hasMore && !infiniteScroll.loading && <div ref={infiniteScroll.triggerRef} className='h-4' />}
      </div>
    </div>
  );
}