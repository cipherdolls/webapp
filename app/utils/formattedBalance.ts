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

export const formattedAllowanceBalance = (allowanceBalance: number | string) =>
  useMemo(() => {
    const numberValue =
      typeof allowanceBalance === 'string' ? parseFloat(allowanceBalance) : typeof allowanceBalance === 'number' ? allowanceBalance : 0;
    const roundedValue = Number(numberValue.toFixed(TOKEN_BALANCE.DECIMAL_PLACES));

    return roundedValue > 0
      ? numberValue.toLocaleString(undefined, {
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        })
      : '0';
  }, [allowanceBalance]);

export const formattedBalanceMotion = (count: MotionValue<number>) => {
  return useTransform(count, (v) => {
    if (v === 0) return "0.00";

    const roundedValue = Number(v.toFixed());

    return roundedValue.toLocaleString(undefined, {
      maximumFractionDigits: TOKEN_BALANCE.DECIMAL_PLACES,
      minimumFractionDigits: 0,
    }).replace(/,/g, '.');
  });
};

