import { formatEther } from 'ethers';
import CreateTokenAllowanceModal from '~/components/CreateTokenAllowanceModal';
import type { TokenPermit } from '~/types';
import type { FetcherWithComponents } from 'react-router';
import { Icons } from '~/components/ui/icons';
import moment from 'moment';
import { InformationBadge } from './ui/InformationBadge';
import PermitHistoryModal from './PermitHistoryModal';
import { cn } from '~/utils/cn';
import * as Button from '~/components/ui/button/button';

interface TokenPermitsListProps {
  permits: TokenPermit[];
  fetcher: FetcherWithComponents<any>;
  tokenBalance: string | number;
  allowance?: string;
}

const TokenPermitsList = ({ permits, fetcher, tokenBalance, allowance }: TokenPermitsListProps) => {
  const handlePermitSigned = async (permit: {
    owner: string;
    spender: string;
    value: string;
    nonce: string;
    deadline: number;
    v: number;
    r: string;
    s: string;
  }) => {
    fetcher.submit(
      {
        actionType: 'createTokenPermit',
        owner: permit.owner,
        spender: permit.spender,
        value: permit.value,
        nonce: permit.nonce,
        deadline: permit.deadline.toString(),
        v: permit.v.toString(),
        r: permit.r,
        s: permit.s,
      },
      {
        method: 'POST',
      }
    );
  };

  const formatPermitAmount = (value: string): string => {
    try {
      const ethValue = parseFloat(formatEther(value));
      return ethValue.toString();
    } catch {
      return '0';
    }
  };

  const isExpired = (deadline: number): boolean => {
    return Date.now() / 1000 > deadline;
  };

  const formatDeadline = (deadline: number): string => {
    return moment.unix(deadline).format('MMM DD, YYYY HH:mm');
  };

  const sortedPermits = [...permits].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className='flex flex-col gap-5 sm:pl-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-heading-h3 text-base-black'>Token Permits</h3>
        <div className='flex items-center gap-2'>
          <InformationBadge
            tooltipText='Token permits allow the CipherDolls platform to spend your LOV tokens for chat functionality.'
            className='size-6 !max-w-[300px]'
            popoverClassName='max-w-[320px]'
            side='top'
          />
        </div>
      </div>

      <div className='p-2 pt-0 rounded-xl flex flex-col bg-gradient-1'>
        {permits.length !== 0 && (
          <div className='flex justify-between py-4 px-4'>
            <CreateTokenAllowanceModal tokenBalance={tokenBalance} onPermitSigned={handlePermitSigned}>
              <button className={cn('flex items-center justify-center gap-2 group ', permits.length === 0 && 'col-span-2')}>
                <Icons.pen className='group-hover:text-base-black/50 transition-colors' />
                <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                  Create Allowances
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

        {permits.length === 0 ? (
          <div className='py-6 px-6 flex flex-col items-center gap-2'>
            <h1 className='text-heading-h1'>🎁</h1>
            <div className='flex flex-col gap-1 text-center'>
              <h4 className='text-heading-h4 text-base-black'>Free LOV Token!</h4>
              <p className='text-body-md text-neutral-01'>Get a Free LOV token with your first Token Permit in Cipherdolls</p>

              <CreateTokenAllowanceModal tokenBalance={tokenBalance} onPermitSigned={handlePermitSigned}>
                <button className='underline text-neutral-01 hover:opacity-80 transition-opacity'>Create allowances.</button>
              </CreateTokenAllowanceModal>
            </div>
          </div>
        ) : sortedPermits.length > 0 ? (
          <div className='p-3 bg-white rounded-xl cursor-pointer hover:bg-white/80 hover:drop-shadow-md transition-all'>
            <div className='flex items-center gap-3'>
              <button className='sm:size-10 size-8 flex text-2xl items-center justify-center bg-black/5 backdrop-blur-48 rounded-full relative shrink-0'>
                💰
              </button>
              <div className='flex-1'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='text-heading-h4 font-semibold text-base-black'>LOV Token Allowance</h4>
                  {isExpired(sortedPermits[0].deadline) && (
                    <span className='text-xs text-specials-danger font-medium px-2 py-1 bg-specials-danger/10 rounded-full'>Expired</span>
                  )}
                </div>

                <div className='space-y-2'>
                  <div className='w-full bg-neutral-04 rounded-full h-2'>
                    <div
                      className='bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300'
                      style={{
                        width: `${
                          allowance && sortedPermits[0].value
                            ? Math.min((parseFloat(allowance) / parseFloat(formatPermitAmount(sortedPermits[0].value))) * 100, 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='py-6 px-6 flex flex-col items-center gap-2'>
            <h1 className='text-heading-h1'>🔐</h1>
            <div className='flex flex-col gap-1 text-center'>
              <h4 className='text-heading-h4 text-base-black'>No Token Allowances</h4>
              <p className='text-body-md text-neutral-01'>
                You don't have any allowances.
                <CreateTokenAllowanceModal tokenBalance={tokenBalance} onPermitSigned={handlePermitSigned}>
                  <button className='underline hover:opacity-80 transition-opacity'>Create allowances.</button>
                </CreateTokenAllowanceModal>
              </p>
            </div>
          </div>
        )}

        {sortedPermits.length > 0 && (
          <div className='text-body-sm text-neutral-01 font-medium text-right mt-2 flex items-center justify-between gap-1'>
            <div>
              Remaining: <span className='text-base-black font-semibold'>{allowance ? parseFloat(allowance).toFixed(2) : '0.00'} LOV</span>
            </div>
            <div>
              Total: <span className='text-base-black font-semibold'>{formatPermitAmount(sortedPermits[0].value)} LOV</span>
            </div>
          </div>
        )}
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

export default TokenPermitsList;
