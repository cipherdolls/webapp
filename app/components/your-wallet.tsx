import { Icons } from './ui/icons';
import OP from '~/assets/svg/op-png.png';
import { useRefreshTokenBalance } from '~/hooks/queries/userMutations';
import { useUser } from '~/hooks/queries/userQueries';
import { TOKEN_BALANCE, uniswapUrl } from '~/constants';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { showToast } from '~/components/ui/toast';
import { animate, motion, useMotionValue } from 'motion/react';
import { formattedBalanceMotion, formattedTokenBalance } from '~/utils/formattedBalance';
import { useCreateTokenPermit } from '~/hooks/queries/tokenMutations';
import { useTokenPermits } from '~/hooks/queries/tokenQueries';
import { formatEther } from 'ethers';
import { InformationBadge } from '~/components/ui/InformationBadge';
import CreateTokenAllowanceModal from '~/components/CreateTokenAllowanceModal';
import { cn } from '~/utils/cn';
import PermitHistoryModal from '~/components/PermitHistoryModal';
import * as Button from '~/components/ui/button/button';

function YourWalletSkeleton() {
  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <div className='rounded-[10px] h-6 bg-neutral-04 w-36 animate-pulse'></div>
        <div className='rounded-full h-6 w-6 my-1.5 bg-neutral-04 animate-pulse'></div>
      </div>
      <div className='grid grid-cols-1'>
        <div className='bg-neutral-04 rounded-xl p-3 h-20 animate-pulse'></div>
      </div>
    </div>
  );
}

const isValidTokenBalance = (balance: unknown): boolean => {
  if (balance === null || balance === undefined) return false;
  const num = typeof balance === 'string' ? parseFloat(balance) : typeof balance === 'number' ? balance : 0;
  return !isNaN(num) && isFinite(num);
};

export const YourWallet = () => {
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [showError, setShowError] = useState(false);

  const { data: user, isLoading: userLoading } = useUser();
  const refreshTokenBalanceMutation = useRefreshTokenBalance();
  const { data: tokenPermitsPaginated, isLoading: tokenPermitsLoading } = useTokenPermits();

  // Always run hooks - move calculations above early return
  const permits = tokenPermitsPaginated?.data || [];
  const allowance = user?.tokenAllowance || 0;
  const firstPermit = permits[0];


  const countTokens = useMotionValue(0);
  const formattedBalance = formattedBalanceMotion(countTokens);

  const { isPending: isRefreshingBalance, isError, error } = refreshTokenBalanceMutation;

  const rawBalance = user?.tokenBalance || '0';
  const validatedBalance = isValidTokenBalance(rawBalance) ? rawBalance : '0';

  const rawSpendable = user?.tokenSpendable || '0';
  const validatedSpendable = isValidTokenBalance(rawSpendable) ? rawSpendable : '0';
  const formattedSpendable = formattedTokenBalance(validatedSpendable);


  const handleRefreshBalance = useCallback(() => {
    if (!user) return;

    const now = Date.now();
    if (now - lastRefreshTime < TOKEN_BALANCE.RATE_LIMIT_MS) {
      return;
    }

    setLastRefreshTime(now);
    refreshTokenBalanceMutation.mutate(
      {
        userId: user.id,
        signerAddress: user.signerAddress,
      },
      {
        onSuccess: () => {
          showToast({
            icon: <Icons.thumb className='w-8 h-8 text-specials-success' />,
            title: 'User updated',
            description: 'Balance refreshed successfully!',
            duration: 3000,
          });
        },
      }
    );
  }, [user, refreshTokenBalanceMutation, lastRefreshTime]);

  const canRefresh = useMemo(() => {
    if (lastRefreshTime === 0) return true;
    return Date.now() - lastRefreshTime >= TOKEN_BALANCE.RATE_LIMIT_MS;
  }, [lastRefreshTime]);

  const formatPermitAmount = (value: string): string => {
    try {
      const ethValue = parseFloat(formatEther(value));
      return ethValue.toString();
    } catch {
      return '0';
    }
  };

  const formattedFirstPermitAmount = useMemo(() => (firstPermit ? formatPermitAmount(firstPermit.value) : '0'), [firstPermit]);

  useEffect(() => {
    const controls = animate(countTokens, Number(validatedBalance), { duration: 2 });
    return () => controls.stop();
  }, [validatedBalance]);

  useEffect(() => {
    if (isError && !showError) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), TOKEN_BALANCE.FEEDBACK_TIMEOUT_MS);
      return () => clearTimeout(timer);
    }
  }, [isError, showError]);

  console.log(formattedSpendable)

  if (userLoading || !user || tokenPermitsLoading) {
    return <YourWalletSkeleton />;
  }

  return (
    <>
      <div className='flex flex-col gap-5 relative'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h3 className='text-heading-h3 text-base-black'>Your Wallet</h3>
            <motion.button
              transition={{ duration: 1 }}
              animate={isRefreshingBalance && { transform: 'rotate(-360deg)' }}
              onClick={handleRefreshBalance}
              disabled={isRefreshingBalance || !canRefresh}
              className='p-0.5 rounded-lg text-base-black hover:opacity-60 transition-all disabled:opacity-50'
              title='Refresh token balance'
            >
              <Icons.refresh className='w-5 h-5' />
            </motion.button>
          </div>

          <InformationBadge className='size-6' side='top' tooltipText='Your personal wallet in Cipherdolls' popoverClassName='ml-auto' />
        </div>

        {showError && (
          <div className='text-specials-danger text-sm absolute top-0 -translate-y-full right-0'>
            Error: {error?.message || 'Failed to refresh balance'}
          </div>
        )}
      </div>

      <div className='flex flex-col gap-5'>
        <div className='p-2 pt-0 rounded-xl flex gap-2 flex-col bg-gradient-1'>
          <a href={uniswapUrl} target={'_blank'}>
            <div className='grid grid-cols-1 mt-2'>
              <div className='bg-white rounded-xl p-3 flex gap-4 cursor-pointer shadow-md hover:bg-white/70 hover:shadow-sm duration-200 transition-all'>
                <button className='flex items-center justify-center rounded-full relative shrink-0 p-2 h-fit w-fit'>
                  <Icons.iconLogo className={'text-base-black w-10 h-10'} />
                  <div className='absolute -bottom-1 -right-1 size-5 rounded-full flex items-center justify-center'>
                    <img src={OP} alt='OP' />
                  </div>
                </button>

                <div className='flex flex-col gap-1 flex-1 pr-3'>
                  <div className='flex justify-between text-heading-h3 font-semibold text-base-black border-b border-dashed pb-2 border-neutral-03'>
                    <motion.span className='block truncate w-fit max-w-52 pr-2 lg:max-w-44'>{formattedBalance}</motion.span>
                    <span>LOV</span>
                  </div>

                  <div className='flex justify-between text-body-sm text-neutral-02'>
                    <span>Spendable:</span>
                    <span className='font-semibold'>{formattedSpendable}</span>
                  </div>
                  <div className='flex justify-between text-body-sm text-neutral-02'>
                    <span>Allowance:</span>
                    <span className='font-semibold'>{allowance.toFixed()}</span>
                  </div>
                </div>
              </div>
            </div>
          </a>

          <a href={uniswapUrl} target={'_blank'}>
            <Button.Root variant='primary' className='w-full'>
              Get LOV Token
            </Button.Root>
          </a>

          {permits.length > 0 && (
            <CreateTokenAllowanceModal>
              <Button.Root size='sm' variant='secondary' className='w-full border border-neutral-04'>
                Set Allowance
              </Button.Root>
            </CreateTokenAllowanceModal>
          )}
        </div>
      </div>
    </>
  );
};
