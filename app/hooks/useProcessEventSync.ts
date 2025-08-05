import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { ProcessEvent } from '~/types';

/**
 * Hook to sync processEvents with TanStack Query cache
 * This updates cached data when MQTT processEvents arrive
 */
export function useProcessEventSync() {
  const queryClient = useQueryClient();

  const syncProcessEvent = useCallback(
    (event: ProcessEvent) => {
      const { resourceName, resourceId, resourceAttributes } = event;

      if (!resourceAttributes || Object.keys(resourceAttributes).length === 0) {
        return;
      }

      // Update individual resource cache
      const individualKey = [resourceName.toLowerCase(), resourceId];
      queryClient.setQueryData(individualKey, (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, ...resourceAttributes };
      });

      // Update list caches that might contain this resource
      const listKey = [resourceName.toLowerCase() + 's']; // e.g., 'messages', 'users'
      queryClient.setQueryData(listKey, (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((item: any) =>
            item.id === resourceId ? { ...item, ...resourceAttributes } : item
          ),
        };
      });

      // For paginated data
      queryClient.setQueriesData(
        { queryKey: [resourceName.toLowerCase() + 's'], type: 'active' },
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map((item: any) =>
              item.id === resourceId ? { ...item, ...resourceAttributes } : item
            ),
          };
        }
      );

      console.log(`[ProcessEventSync] Updated ${resourceName}:${resourceId}`, resourceAttributes);
    },
    [queryClient]
  );

  return { syncProcessEvent };
}