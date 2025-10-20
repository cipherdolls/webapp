import { useMemo } from 'react';
import { TOKEN_BALANCE } from '~/constants';
import { useTransform } from 'motion/react';
import type { MotionValue } from 'motion';

export const formattedTokenBalance = (validatedBalance: number | string) =>
  useMemo(() => {
    const numberValue =
      typeof validatedBalance === 'string' ? parseFloat(validatedBalance) : typeof validatedBalance === 'number' ? validatedBalance : 0;
    const roundedValue = Number(numberValue.toFixed(TOKEN_BALANCE.DECIMAL_PLACES));

    return roundedValue > 0
      ? numberValue.toLocaleString(undefined, {
          maximumFractionDigits: TOKEN_BALANCE.DECIMAL_PLACES,
          minimumFractionDigits: TOKEN_BALANCE.DECIMAL_PLACES,
        })
      : '0';
  }, [validatedBalance]);

export const formattedBalanceMotion = (count: MotionValue) => {
  if (count.get() === 0) {
    return useTransform(() => count.get().toFixed());
  }

  return useTransform(() =>
    count.get().toLocaleString(undefined, {
      maximumFractionDigits: TOKEN_BALANCE.DECIMAL_PLACES,
      minimumFractionDigits: TOKEN_BALANCE.DECIMAL_PLACES,
    })
  );
};
