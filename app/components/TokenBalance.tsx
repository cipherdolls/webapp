import { Icons } from './ui/icons';
import OP from '~/assets/svg/op-png.png';
import { useRefreshTokenBalance } from '~/hooks/queries/userMutations';
import { useUser } from '~/hooks/queries/userQueries';
import { TOKEN_BALANCE } from '~/constants';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { showToast } from '~/components/ui/toast';

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
    refreshTokenBalanceMutation.mutate({
      userId: user.id,
      signerAddress: user.signerAddress,
    }, {
      onSuccess: () => {
        showToast({
          icon: <Icons.thumb className='w-8 h-8 text-specials-success' />,
          title: 'User updated',
          description: 'Balance refreshed successfully!',
          duration: 3000,
        })
      }
    });
  }, [user, refreshTokenBalanceMutation, lastRefreshTime]);

  const formattedBalance = useMemo(() => {
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

  const canRefresh = useMemo(() => {
    if (lastRefreshTime === 0) return true;
    return Date.now() - lastRefreshTime >= TOKEN_BALANCE.RATE_LIMIT_MS;
  }, [lastRefreshTime]);

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
        <button
          onClick={handleRefreshBalance}
          disabled={isRefreshingBalance || !canRefresh}
          className='p-2 rounded-lg text-[#350D2A]/40 hover:text-[#350D2A] transition-all disabled:opacity-50'
          title='Refresh token balance'
        >
          <Icons.refresh className={`w-5 h-5  ${isRefreshingBalance ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {showError && (
        <div className='text-specials-danger text-sm absolute top-0 -translate-y-full right-0'>
          Error: {error?.message || 'Failed to refresh balance'}
        </div>
      )}
      <div className='grid grid-cols-1'>
        <div className='bg-white rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/80 hover:drop-shadow-md transition-all'>
          <button className='sm:size-14 size-10 flex items-center justify-center bg-gradient-1 backdrop-blur-48 rounded-full relative shrink-0'>
            <Icons.iconLogo className={'text-base-black'} />
            <div className='absolute -bottom-1 -right-1 size-5 rounded-full flex items-center justify-center'>
              <img src={OP} alt='OP' />
            </div>
          </button>

          <div className='flex justify-between text-heading-h3 font-semibold text-base-black'>
            <span className='block truncate w-fit max-w-52 pr-2 lg:max-w-44'>{formattedBalance}</span>
            <span className='text-neutral-01'>LOV</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenBalance;
