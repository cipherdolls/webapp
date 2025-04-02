import { Icons } from './ui/icons';

const AccountBalance = ({ balance }: { balance: string | number }) => {
  return (
    <div className='flex items-center sm:gap-6 gap-4'>
      <button className='sm:size-14 size-10 flex items-center justify-center bg-gradient-1 backdrop-blur-48 rounded-full'>
        <Icons.eth className='sm:w-auto sm:h-auto w-4 h-7' />
      </button>
      <h2 className='text-heading-h2 sm:text-heading-h1 font-semibold break-all'>
        {balance} <span className='text-neutral-01'>ETH</span>
      </h2>
    </div>
  );
};

export default AccountBalance;
