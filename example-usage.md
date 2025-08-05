# TanStack Query + MQTT Real-time Updates Usage

## How it works:

1. **TanStack Query** handles all API calls and caching
2. **MQTT processEvents** automatically update the cache when data changes on the backend
3. Components automatically re-render when their data updates

## Setup in your route components:

```tsx
// In your main layout or route component
import { useRealtimeSync } from '~/hooks/useRealtimeSync';

export function ChatRoute() {
  const { userId, chatId } = useLoaderData();
  
  // This automatically syncs MQTT events with TanStack Query cache
  useRealtimeSync({ userId, chatId });
  
  return <Outlet />;
}
```

## Using in components:

```tsx
// Instead of clientLoader, use query hooks
import { useMessage, useUser, useChat } from '~/hooks/useResourceQueries';

export function MessageComponent({ messageId }: { messageId: string }) {
  // This will automatically update when a processEvent arrives
  const { data: message, isLoading } = useMessage(messageId);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <p>{message.content}</p>
      <span>Completed: {message.completed ? 'Yes' : 'No'}</span>
      <span>Updated: {message.updatedAt}</span>
    </div>
  );
}

export function UserBalance({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);
  
  // When backend updates balance via cron -> processEvent -> cache updates -> re-render
  return (
    <div>
      Balance: {user?.tokenBalance}
      Allowance: {user?.tokenAllowance}
    </div>
  );
}
```

## Infinite Queries for Lists:

```tsx
import { useMessages } from '~/hooks/useResourceQueries';

export function MessagesList({ chatId }: { chatId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(chatId);

  // Individual messages in the list will update automatically via processEvents
  
  return (
    <div>
      {data?.pages.map((page) =>
        page.data.map((message) => (
          <MessageComponent key={message.id} messageId={message.id} />
        ))
      )}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          Load More
        </button>
      )}
    </div>
  );
}
```

## The magic happens automatically:

1. **Initial load**: `useMessage('123')` fetches data from API
2. **Backend update**: Message content changes, sends processEvent via MQTT
3. **Cache update**: `useProcessEventSync` updates the cached message
4. **UI update**: Component re-renders with new data, no API call needed!

## No more:
- ❌ clientLoader functions
- ❌ Manual API calls on updates  
- ❌ Stale UI data
- ❌ Complex cache invalidation

## Instead:
- ✅ Automatic real-time updates
- ✅ Smart caching with TanStack Query
- ✅ Optimistic updates
- ✅ Background refetching
- ✅ Simple component code