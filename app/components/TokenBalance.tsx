import { formatNumberWithCommas } from '~/utils/formatNumberWithCommas';
import { Icons } from './ui/icons';
import OP from '~/assets/svg/op-png.png';

interface TokenBalanceProps {
  balance: string | number;
  className?: string;
}

const TokenBalance = ({ balance }: TokenBalanceProps) => {
  const formattedBalance = typeof balance === 'string' ? parseFloat(balance) : balance;

  return (
    <div className='flex flex-col gap-5 sm:pl-4'>
      <h3 className='text-heading-h3 text-base-black'>Your Balance</h3>
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
