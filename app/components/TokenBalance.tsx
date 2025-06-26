import { formatNumberWithCommas } from '~/utils/formatNumberWithCommas';
import { Icons } from './ui/icons';
import OP from '~/assets/svg/op-png.png';
import { Card } from '~/components/card';

interface TokenBalanceProps {
  balance: string | number;
  className?: string;
}

const TokenBalance = ({ balance }: TokenBalanceProps) => {
  const formattedBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
  const displayBalance = formatNumberWithCommas(formattedBalance);

  return (
    <Card.Root className='sm:pl-4 sm:max-w-[352px] max-h-max'>
      <div className='flex items-center justify-between'>
        <Card.Label>Your Balance</Card.Label>
      </div>
      <Card.Main className={' flex-none'}>
        <Card.Content className={'border-t-0'}>
          <div className='flex items-center gap-4 p-3'>
            <button className='sm:size-14 size-10 flex items-center justify-center bg-gradient-1 backdrop-blur-48 rounded-full relative shrink-0'>
              <Icons.iconLogo className={'text-base-black'} />
              <div className='absolute -bottom-1 -right-1 size-5 rounded-full flex items-center justify-center'>
                <img src={OP} alt='OP' />
              </div>
            </button>
            <span className='text-heading-h3 font-semibold text-base-black'>
              {displayBalance} <span className='text-neutral-01'>LOW</span>
            </span>
          </div>
        </Card.Content>
      </Card.Main>
    </Card.Root>
  );
};

export default TokenBalance;
