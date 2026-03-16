import { Icons } from './ui/icons';
import { useRefreshTokenBalance } from '~/hooks/queries/userMutations';
import { useUser } from '~/hooks/queries/userQueries';
import { TOKEN_BALANCE, uniswapUrl } from '~/constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { showToast } from '~/components/ui/toast';
import { motion } from 'motion/react';
import { formattedTokenBalance } from '~/utils/formattedBalance';
import { useTokenPermits } from '~/hooks/queries/tokenQueries';
import { InformationBadge } from '~/components/ui/InformationBadge';
import CreateTokenAllowanceModal from '~/components/CreateTokenAllowanceModal';
import * as Button from '~/components/ui/button/button';

function YourWalletSkeleton() {
  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <div className='rounded-[10px] h-6 bg-neutral-04 w-36 animate-pulse'></div>
        <div className='rounded-full h-6 w-6 my-1.5 bg-neutral-04 animate-pulse'></div>
      </div>

      <div className='grid grid-cols-1'>
        <div className='bg-neutral-04 rounded-xl p-3 h-[165px] animate-pulse'></div>
      </div>
      {/*<div className='bg-neutral-04 rounded-full p-3 h-12 animate-pulse'></div>*/}
    </div>
  );
}

const isValidTokenBalance = (balance: unknown): boolean => {
  if (balance === null || balance === undefined) return false;
  const num = typeof balance === 'string' ? parseFloat(balance) : typeof balance === 'number' ? balance : 0;
  return !isNaN(num) && isFinite(num);
};

interface YourWalletProps {
  disabled?: boolean;
}

export const YourWallet = ({ disabled = false }: YourWalletProps) => {
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [showError, setShowError] = useState(false);

  const { data: user, isLoading: userLoading } = useUser();
  const refreshTokenBalanceMutation = useRefreshTokenBalance();
  const { data: tokenPermitsPaginated, isLoading: tokenPermitsLoading } = useTokenPermits();

  // Always run hooks - move calculations above early return
  const permits = tokenPermitsPaginated?.data || [];
  const allowance = user?.tokenAllowance || 0;

  const { isPending: isRefreshingBalance, isError, error } = refreshTokenBalanceMutation;

  const rawBalance = user?.tokenBalance || '0';
  const validatedBalance = isValidTokenBalance(rawBalance) ? rawBalance : '0';

  const rawSpendable = user?.tokenSpendable || '0';
  const validatedSpendable = isValidTokenBalance(rawSpendable) ? rawSpendable : '0';

  const formattedBalance = formattedTokenBalance(validatedBalance);
  const formattedSpendable = formattedTokenBalance(validatedSpendable);
  const formattedAllowance = formattedTokenBalance(allowance)

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
    if (isError && !showError) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), TOKEN_BALANCE.FEEDBACK_TIMEOUT_MS);
      return () => clearTimeout(timer);
    }
  }, [isError, showError]);

  if (userLoading || !user || tokenPermitsLoading) {
    return <YourWalletSkeleton />;
  }

  return (
    <div className={`flex flex-col gap-5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className='flex flex-col gap-5 relative'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <h3 className='text-heading-h3 text-base-black'>Your Wallet</h3>
              <motion.button
                transition={{ duration: 1 }}
                animate={isRefreshingBalance && { transform: 'rotate(-360deg)' }}
                onClick={handleRefreshBalance}
                disabled={disabled || isRefreshingBalance || !canRefresh}
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
          <div className='bg-gradient-1 p-2 rounded-xl'>
            <div className='bg-base-white rounded-xl p-3 flex gap-4 shadow-md duration-200 transition-all'>
              <div className='flex flex-col gap-2 flex-1'>
                <div className='flex justify-between items-center text-body-md font-semibold text-base-black'>
                  <span>💰 Balance:</span>

                  <div className='flex items-center flex-1 justify-end'>
                    <div className='flex items-center pr-2'>
                      <motion.span className='block text-body-lg truncate w-fit max-w-52 pr-1 lg:max-w-44'>{disabled ? '—' : formattedBalance}</motion.span>
                      <span>LOV</span>
                    </div>

                    <a href={disabled ? undefined : uniswapUrl} target={disabled ? undefined : '_blank'} rel='noreferrer' className={disabled ? 'pointer-events-none' : ''}>
                      <Button.Root size='icon' variant='primary' className='text-body-sm h-9 w-16' disabled={disabled}>
                        Buy
                      </Button.Root>
                    </a>
                  </div>
                </div>

                <div className='flex justify-between items-center text-body-md font-semibold text-base-black '>
                  <span>🔐 Allowance:</span>

                  <div className='flex items-center flex-1 justify-end'>
                    <span className='block truncate text-body-lg w-fit max-w-52 pr-2'>{disabled ? '—' : formattedAllowance} LOV</span>

                    <CreateTokenAllowanceModal>
                      <Button.Root size='icon' variant='primary' className='text-body-sm h-9 w-16' disabled={disabled}>
                        Set
                      </Button.Root>
                    </CreateTokenAllowanceModal>
                  </div>
                </div>

                <div className='flex justify-between items-center text-heading-h4 pt-3 -mx-3 px-3 -mb-3 pb-3 rounded-b-xl border-t border-neutral-04 bg-gradient-1 font-semibold text-base-black'>
                  <div className='flex items-center gap-2'>
                    <div className='flex items-center justify-center rounded-full relative shrink-0 p-0.5 bg-base-white duration-200 transition-all h-fit w-fit shadow-black/30 shadow-md'>
                      <Icons.iconLogo className={'text-base-black w-5 h-5'} />
                    </div>

                    <span>Spendable:</span>
                  </div>

                  <p className='block truncate w-fit max-w-52'>
                    {disabled ? '—' : formattedSpendable} <span>LOV</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};
