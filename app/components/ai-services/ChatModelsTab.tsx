import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import * as Accordion from '@radix-ui/react-accordion';
import type { ChatModelsPaginated } from '~/types';
import { fetchPaginatedData } from '~/utils/fetchWithAuth';
import SearchChatModels from '~/components/ui/search-chat-models';
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll';
import { Icons } from '~/components/ui/icons';
import { ChatModelItem } from '~/components/chat-models/ChatModelItem';
import { ChatModelSkeleton } from '~/components/chat-models/ChatModelSkeleton';

type ChatModelsTabProps = {
  initialData: ChatModelsPaginated | null;
};

export function ChatModelsTab({ initialData }: ChatModelsTabProps) {
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
    return fetchPaginatedData<ChatModelsPaginated>('chat-models', searchParams, page, 10);
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

  const filteredChatModels = useMemo(() => {
    return [...infiniteScroll.data];
  }, [infiniteScroll.data]);

  if (!hasInitiallyLoaded || !initialData) {
    return <ChatModelSkeleton />;
  }

  return (
    <div className='w-full'>
      {/* Search Section */}
      <div className='mb-6'>
        <SearchChatModels />
      </div>

      {/* Results Section */}
      <div className='pb-5'>
        {filteredChatModels.length === 0 ? (
          <p className='text-body-md text-neutral-01 text-center'>No chat models found.</p>
        ) : (
          <Accordion.Root type='multiple' className='space-y-3'>
            {filteredChatModels.map((chatModel) => (
              <ChatModelItem key={chatModel.id} chatModel={chatModel} />
            ))}
          </Accordion.Root>
        )}

        {infiniteScroll.error && (
          <div className='text-center text-red-500 py-4'>
            <p>Failed to load chat models: {infiniteScroll.error}</p>
          </div>
        )}

        {infiniteScroll.loading && (
          <div className='text-center py-4'>
            <div className='inline-flex items-center gap-2'>
              <Icons.loading className='size-4 animate-spin' />
              <span className='text-neutral-01'>Loading more chat models...</span>
            </div>
          </div>
        )}

        {infiniteScroll.hasMore && !infiniteScroll.loading && <div ref={infiniteScroll.triggerRef} className='h-4' />}
      </div>
    </div>
  );
}