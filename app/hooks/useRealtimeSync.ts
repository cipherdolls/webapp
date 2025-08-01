import { useProcessEventSync } from './useProcessEventSync';
import { useUserEvents } from './useUserEvents';
import { useChatEvents } from './useChatEvents';
import type { ProcessEvent } from '~/types';

interface UseRealtimeSyncOptions {
  userId?: string;
  chatId?: string;
  enabled?: boolean;
}

/**
 * Hook that automatically syncs MQTT processEvents with TanStack Query cache
 * Use this in your main layouts or route components
 */
export function useRealtimeSync({ userId, chatId, enabled = true }: UseRealtimeSyncOptions) {
  const { syncProcessEvent } = useProcessEventSync();

  // Handle user-level events (User, Avatar, etc.)
  useUserEvents(userId || '', {
    onProcessEvent: syncProcessEvent,
    enabled: enabled && !!userId,
  });

  // Handle chat-level events (Message, Chat, etc.)
  useChatEvents(chatId || '', {
    onProcessEvent: syncProcessEvent,
    enabled: enabled && !!chatId,
  });

  return { syncProcessEvent };
}