import { Icons } from './ui/icons';
import OP from '~/assets/svg/op-png.png';
import { useRefreshTokenBalance } from '~/hooks/queries/userMutations';
import { useUser } from '~/hooks/queries/userQueries';
import { TOKEN_BALANCE, uniswapUrl } from '~/constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { showToast } from '~/components/ui/toast';
import { animate, motion, useMotionValue } from 'motion/react';
import { formattedBalanceMotion } from '~/utils/formattedBalance';

function TokenBalanceSkeleton() {
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

const TokenBalance = () => {
  const { data: user, isLoading: userLoading } = useUser();
  const refreshTokenBalanceMutation = useRefreshTokenBalance();
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [showError, setShowError] = useState(false);

  const countTokens = useMotionValue(0);
  const formattedBalance = formattedBalanceMotion(countTokens);

  const { isPending: isRefreshingBalance, isError, isSuccess, error } = refreshTokenBalanceMutation;

  const rawBalance = user?.tokenBalance || '0';
  const validatedBalance = isValidTokenBalance(rawBalance) ? rawBalance : '0';

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

  if (userLoading || !user) {
    return <TokenBalanceSkeleton />;
  }

  return (
    <div className='flex flex-col gap-5 relative'>
      <div className='flex items-center justify-between'>
        <h3 className='text-heading-h3 text-base-black'>Your Balance</h3>
        <motion.button
          transition={{ duration: 1 }}
          animate={isRefreshingBalance && { transform: 'rotate(-360deg)' }}
          onClick={handleRefreshBalance}
          disabled={isRefreshingBalance || !canRefresh}
          className='p-2 rounded-lg text-[#350D2A]/40 hover:text-[#350D2A] transition-all disabled:opacity-50'
          title='Refresh token balance'
        >
          <Icons.refresh className='w-5 h-5' />
        </motion.button>
      </div>

      {showError && (
        <div className='text-specials-danger text-sm absolute top-0 -translate-y-full right-0'>
          Error: {error?.message || 'Failed to refresh balance'}
        </div>
      )}
      <a href={uniswapUrl} target={'_blank'}>
        <div className='grid grid-cols-1'>
          <div className='bg-white rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/80 hover:shadow-md transition-all'>
            <button className='sm:size-14 size-10 flex items-center justify-center bg-gradient-1 backdrop-blur-48 rounded-full relative shrink-0'>
              <Icons.iconLogo className={'text-base-black'} />
              <div className='absolute -bottom-1 -right-1 size-5 rounded-full flex items-center justify-center'>
                <img src={OP} alt='OP' />
              </div>
            </button>

            <div className='flex justify-between text-heading-h3 font-semibold text-base-black'>
              <motion.span className='block truncate w-fit max-w-52 pr-2 lg:max-w-44'>{formattedBalance}</motion.span>
              <span className='text-neutral-01'>LOV</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default TokenBalance;
