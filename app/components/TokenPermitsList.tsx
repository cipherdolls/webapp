import { formatEther } from 'ethers';
import { formatNumberWithCommas } from '~/utils/formatNumberWithCommas';
import { Card } from '~/components/card';
import CreateTokenAllowanceModal from '~/components/CreateTokenAllowanceModal';
import DetailRow from '~/components/ui/detail/detail-row';
import type { TokenPermit } from '~/types';
import type { FetcherWithComponents } from 'react-router';
import * as Accordion from '@radix-ui/react-accordion';
import { Icons } from '~/components/ui/icons';
import moment from 'moment';
import { InformationBadge } from './ui/InformationBadge';

interface TokenPermitsListProps {
  permits: TokenPermit[];
  fetcher: FetcherWithComponents<any>;
  userId: string;
  tokenBalance: string | number;
}

const TokenPermitsList = ({ permits, fetcher, userId, tokenBalance }: TokenPermitsListProps) => {
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
      return formatNumberWithCommas(ethValue);
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
    <Card.Root className='sm:pl-4 sm:max-w-[352px] max-h-max'>
      <div className='flex items-center justify-between'>
        <Card.Label>Token Permits</Card.Label>
        <div className='flex items-center gap-2'>
          <InformationBadge
            tooltipText='Token permits allow the CipherDolls platform to spend your LOV tokens for chat functionality.'
            className='size-6 !max-w-[300px]'
            side='top'
          />
          {permits.length > 0 && (
            <CreateTokenAllowanceModal tokenBalance={tokenBalance} onPermitSigned={handlePermitSigned}>
              <button className='p-px rounded-full bg-neutral-04 text-neutral-01 hover:bg-neutral-05 hover:text-neutral-02 transition-colors '>
                <Icons.add />
              </button>
            </CreateTokenAllowanceModal>
          )}
        </div>
      </div>
      <Card.Main className='flex-none'>
        <Card.Content className='border-t-0'>
          {permits.length === 0 ? (
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
          ) : (
            <div className='flex flex-col gap-3 divide-y divide-neutral-04'>
              {sortedPermits.map((permit) => (
                <div key={permit.id} className={`p-3 hover:opacity-70 transition-opacity`}>
                  <div className='flex items-center gap-3'>
                    <button className='sm:size-14 size-10 flex text-3xl items-center justify-center bg-gradient-1 backdrop-blur-48 rounded-full relative shrink-0'>
                      💰
                    </button>
                    <div>
                      <h4 className='text-heading-h4 font-semibold text-base-black'>LOW Token Allowance</h4>
                      <p className='text-sm text-neutral-01'>{formatPermitAmount(permit.value)} LOW approved for spending</p>
                    </div>
                    {isExpired(permit.deadline) && (
                      <span className='text-xs text-specials-danger font-medium px-2 py-1 bg-specials-danger/10 rounded-full'>Expired</span>
                    )}
                  </div>

                  <Accordion.Root type='single' collapsible className='w-full'>
                    <Accordion.Item value='details'>
                      <Accordion.Trigger className='flex items-center justify-center w-full py-2 text-sm font-medium text-neutral-01 hover:text-base-black transition-colors group'>
                        <span className='group-data-[state=closed]:block group-data-[state=open]:hidden'>Show Details</span>
                        <span className='group-data-[state=closed]:hidden group-data-[state=open]:block'>Hide Details</span>
                        <Icons.chevronDown className='ml-2 h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180' />
                      </Accordion.Trigger>
                      <Accordion.Content className='overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
                        <div className='flex flex-col gap-4 pt-[18px]'>
                          <DetailRow title='Status' value={isExpired(permit.deadline) ? 'Expired' : 'Active'} />
                          <DetailRow title='Expires' value={formatDeadline(permit.deadline)} />
                          <DetailRow title='Created' value={moment(permit.createdAt).format('MMM DD, YYYY HH:mm')} />
                          <DetailRow title='Permit ID' value={permit.id} />
                          <DetailRow title='Owner' value={permit.owner} />
                          <DetailRow title='Spender' value={permit.spender} />
                          <DetailRow title='Nonce' value={permit.nonce} />
                          <DetailRow title='Deadline (Unix)' value={permit.deadline.toString()} />
                          <DetailRow title='Signature V' value={permit.v.toString()} />
                          <DetailRow title='Signature R' value={permit.r} />
                          <DetailRow title='Signature S' value={permit.s} />
                          {permit.txHash && <DetailRow title='Transaction Hash' value={permit.txHash} />}
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card.Main>
    </Card.Root>
  );
};

export default TokenPermitsList;
