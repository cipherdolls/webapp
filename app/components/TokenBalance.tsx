import { useRouteLoaderData } from 'react-router';
import { Icons } from './ui/icons';
import OP from '~/assets/svg/op-png.png';
import * as Button from '~/components/ui/button/button';
import { useRefreshTokenBalance } from '~/hooks/queries';
import type { User } from '~/types';

const TokenBalance = ({ user }: { user: User }) => {
  const balance = user.tokenBalance || '0';

  const refreshTokenBalanceMutation = useRefreshTokenBalance();

  const handleRefreshBalance = () => {
    refreshTokenBalanceMutation.mutate({
      userId: user.id,
      signerAddress: user.signerAddress,
    });
  };

  const isRefreshingBalance = refreshTokenBalanceMutation.isPending;

  const numberValue = typeof balance === 'string' ? parseFloat(balance) : balance;
  const roundedValue = Number(numberValue.toFixed(3));

  const formattedBalance =
    roundedValue > 0
      ? numberValue.toLocaleString(undefined, {
          maximumFractionDigits: 3,
          minimumFractionDigits: 3,
        })
      : '0';

  return (
    <div className='flex flex-col gap-5 sm:pl-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-heading-h3 text-base-black'>Your Balance</h3>
        <button
          onClick={handleRefreshBalance}
          disabled={isRefreshingBalance}
          className='p-2 rounded-lg text-[#350D2A]/40 hover:text-[#350D2A] transition-all disabled:opacity-50'
          title='Refresh token balance'
        >
          <Icons.refresh className={`w-5 h-5  ${isRefreshingBalance ? 'animate-spin' : ''}`} />
        </button>
      </div>
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

      <a
        href={'https://app.uniswap.org/explore/pools/optimism/0x6d0f116c3c01fa4e20f1b122124927587e9e56d092513f444aba98811e59063d'}
        target={'_blank'}
      >
        <Button.Root variant='primary' className='w-full'>
          Get LOV Token
        </Button.Root>
      </a>
    </div>
  );
};

export default TokenBalance;
