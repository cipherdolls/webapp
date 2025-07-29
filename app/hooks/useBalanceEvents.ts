import { useCallback } from 'react';
import { useUserEvents } from './useUserEvents';
import { useBalance } from '~/providers/BalanceContext';

interface UseBalanceEventsOptions {
  userId: string;
  enabled?: boolean;
}

export function useBalanceEvents({ userId, enabled = true }: UseBalanceEventsOptions) {
  const { updateBalance } = useBalance();

  const handleBalanceUpdate = useCallback(
    (data: { userId: string; weiBalance?: string; freeWeiBalance?: string; tokenBalance?: number }) => {
      const updates: any = {};
      
      if (data.weiBalance !== undefined) {
        updates.weiBalance = data.weiBalance;
      }
      
      if (data.freeWeiBalance !== undefined) {
        updates.freeWeiBalance = data.freeWeiBalance;
      }
      
      if (data.tokenBalance !== undefined) {
        updates.tokenBalance = data.tokenBalance;
      }

      if (Object.keys(updates).length > 0) {
        updateBalance(updates);
      }
    },
    [updateBalance]
  );

  const { balanceUpdatesTopic } = useUserEvents(userId, {
    onBalanceUpdate: handleBalanceUpdate,
    enabled,
  });

  return {
    balanceUpdatesTopic,
  };
}