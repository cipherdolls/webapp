import { Icons } from './ui/icons';
import OP from '~/assets/svg/op-png.png';

interface TokenBalanceProps {
  balance: string | number;
  className?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const TokenBalance = ({ balance, onRefresh, isRefreshing }: TokenBalanceProps) => {
  const formattedBalance = typeof balance === 'string' ? parseFloat(balance) : balance;

  return (
    <div className='flex flex-col gap-5 sm:pl-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-heading-h3 text-base-black'>Your Balance</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className='p-2 rounded-lg text-[#350D2A]/40 hover:text-[#350D2A] transition-all disabled:opacity-50'
            title='Refresh token balance'
          >
            <Icons.refresh className={`w-5 h-5  ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
      <div className='grid grid-cols-1'>
        <div className='bg-white rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/80 hover:drop-shadow-md transition-all'>
          <button className='sm:size-14 size-10 flex items-center justify-center bg-gradient-1 backdrop-blur-48 rounded-full relative shrink-0'>
            <Icons.iconLogo className={'text-base-black'} />
            <div className='absolute -bottom-1 -right-1 size-5 rounded-full flex items-center justify-center'>
              <img src={OP} alt='OP' />
            </div>
          </button>
          <span className='text-heading-h3 font-semibold text-base-black'>
            {formattedBalance.toString()} <span className='text-neutral-01'>LOV</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TokenBalance;
