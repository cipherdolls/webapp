import { formatEther } from 'ethers';
import { useMemo } from 'react';
import CreateTokenAllowanceModal from '~/components/CreateTokenAllowanceModal';

import { Icons } from '~/components/ui/icons';
import { InformationBadge } from './ui/InformationBadge';
import PermitHistoryModal from './PermitHistoryModal';
import { cn } from '~/utils/cn';

import { useTokenPermits } from '~/hooks/queries/tokenQueries';
import { useUser } from '~/hooks/queries/userQueries';

import * as Button from '~/components/ui/button/button';
import { motion } from 'motion/react';
import { uniswapUrl } from '~/constants';

function TokenPermitsListSkeleton() {
  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <div className='rounded-[10px] h-6 bg-neutral-04 w-[156px] animate-pulse'></div>
        <div className='rounded-full h-6 w-6 bg-neutral-04 animate-pulse'></div>
      </div>
      <div className='p-2 pt-0 rounded-xl bg-neutral-04 h-[152px] animate-pulse'></div>
      <div className='rounded-full h-12 bg-neutral-04 w-full animate-pulse'></div>
    </div>
  );
}

const TokenPermitsList = () => {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: tokenPermitsPaginated, isLoading: tokenPermitsLoading } = useTokenPermits();

  // Always run hooks - move calculations above early return
  const permits = tokenPermitsPaginated?.data || [];
  const allowance = user?.tokenAllowance || 0;
  const firstPermit = permits[0];
  const hasPermits = permits.length > 0;

  const formatPermitAmount = (value: string): string => {
    try {
      const ethValue = parseFloat(formatEther(value));
      return ethValue.toString();
    } catch {
      return '0';
    }
  };

  const formatAllowanceAmount = (value: number): string => {
    try {
      // Direct number formatting - no string conversion needed
      if (value > 1e15) {
        // Wei threshold
        const ethValue = parseFloat(formatEther(value.toString()));
        return ethValue.toFixed(2);
      }
      return value.toFixed(2);
    } catch {
      return '0.00';
    }
  };

  const formattedAllowance = useMemo(() => formatAllowanceAmount(allowance), [allowance]);

  const formattedFirstPermitAmount = useMemo(() => (firstPermit ? formatPermitAmount(firstPermit.value) : '0'), [firstPermit]);

  const progressPercentage = useMemo(() => {
    if (!allowance || !firstPermit?.value) return 0;
    try {
      const allowanceFloat = parseFloat(formattedAllowance.replace(',', ''));
      const permitFloat = parseFloat(formattedFirstPermitAmount);
      return Math.min((allowanceFloat / permitFloat) * 100, 100);
    } catch {
      return 0;
    }
  }, [allowance, firstPermit, formattedAllowance, formattedFirstPermitAmount]);

  if (userLoading || tokenPermitsLoading) {
    return <TokenPermitsListSkeleton />;
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <h3 className='text-heading-h3 text-base-black'>Token Allowance</h3>
        <div className='flex items-center gap-2'>
          <InformationBadge
            tooltipText='Token Allowance allow the CipherDolls platform to spend your LOV tokens for chat functionality.'
            className='size-6 !max-w-[300px]'
            popoverClassName='max-w-[320px]'
            side='top'
          />
        </div>
      </div>

      <div className='p-2 pt-0 rounded-xl flex flex-col bg-gradient-1'>
        {hasPermits && (
          <div className='flex justify-between py-4 px-4'>
            <CreateTokenAllowanceModal>
              <button className={cn('flex items-center justify-center gap-2 group ', permits.length === 0 && 'col-span-2')}>
                <Icons.pen className='group-hover:text-base-black/50 transition-colors' />
                <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                  Set Allowance
                </span>
              </button>
            </CreateTokenAllowanceModal>

            <div className='h-6 w-[1px] bg-neutral-04' />

            <PermitHistoryModal permits={permits}>
              <button className='flex w-fit items-center justify-center gap-2 group'>
                <Icons.history className='group-hover:text-base-black/50 transition-colors size-5' />
                <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                  View History
                </span>
              </button>
            </PermitHistoryModal>
          </div>
        )}

        {!hasPermits ? (
          <div className='py-6 px-6 flex flex-col items-center gap-2'>
            <h1 className='text-heading-h1'>🎁</h1>
            <div className='flex flex-col gap-1 text-center'>
              <h4 className='text-heading-h4 text-base-black'>Free LOV Token!</h4>
              <p className='text-body-md text-neutral-01'>Get a Free LOV token with your first Token Permit in Cipherdolls</p>

              <CreateTokenAllowanceModal >
                <button className='underline text-neutral-01 hover:opacity-80 transition-opacity'>Create allowances.</button>
              </CreateTokenAllowanceModal>
            </div>
          </div>
        ) : (
          <div className='p-3 bg-white rounded-xl cursor-pointer hover:bg-white/80 hover:shadow-md transition-all'>
            <div className='flex items-center gap-3'>
              <button className='sm:size-10 size-8 flex text-2xl items-center justify-center bg-black/5 backdrop-blur-48 rounded-full relative shrink-0'>
                💰
              </button>
              <div className='flex-1'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='text-heading-h4 font-semibold text-base-black'>LOV Token Allowance</h4>
                </div>

                <div className='space-y-2'>
                  <div className='w-full bg-neutral-04 rounded-full h-2'>
                    <motion.div
                      layout
                      initial={{ width: '1px' }}
                      animate={{ width: progressPercentage + '%' }}
                      transition={{ duration: 1.5 }}
                      className='h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full relative overflow-hidden'
                    >
                      <motion.div
                        className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent'
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasPermits && (
          <div className='text-body-sm text-neutral-01 font-medium text-right mt-2 flex items-center justify-between gap-1'>
            <div>
              Remaining: <span className='text-base-black font-semibold'>{allowance ? formattedAllowance : '0.00'} LOV</span>
            </div>
            <div>
              Total: <span className='text-base-black font-semibold'>{formattedFirstPermitAmount} LOV</span>
            </div>
          </div>
        )}
      </div>

      <a href={uniswapUrl} target={'_blank'}>
        <Button.Root variant='primary' className='w-full'>
          Get LOV Token
        </Button.Root>
      </a>
    </div>
  );
};

export default TokenPermitsList;
