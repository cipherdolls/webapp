import { formatEther } from 'ethers';
import CreateTokenAllowanceModal from '~/components/CreateTokenAllowanceModal';
import DetailRow from '~/components/ui/detail/detail-row';
import type { TokenPermit } from '~/types';
import type { FetcherWithComponents } from 'react-router';
import * as Accordion from '@radix-ui/react-accordion';
import { Icons } from '~/components/ui/icons';
import moment from 'moment';
import { InformationBadge } from './ui/InformationBadge';
import PermitHistoryModal from './PermitHistoryModal';
import { cn } from '~/utils/cn';
import React from 'react';

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
              <div>
                <h4 className='text-heading-h4 font-semibold text-base-black'>LOV Token Allowance</h4>
                <div className='flex items-center justify-between'>
                  <p className='text-sm text-neutral-01'>{formatPermitAmount(sortedPermits[0].value)} LOV approved for spending</p>
                  {isExpired(sortedPermits[0].deadline) && (
                    <span className='text-xs text-specials-danger font-medium px-2 py-1 bg-specials-danger/10 rounded-full'>Expired</span>
                  )}
                </div>
              </div>
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
                    <DetailRow title='Status' value={isExpired(sortedPermits[0].deadline) ? 'Expired' : 'Active'} />
                    <DetailRow title='Expires' value={formatDeadline(sortedPermits[0].deadline)} />
                    <DetailRow title='Created' value={moment(sortedPermits[0].createdAt).format('MMM DD, YYYY HH:mm')} />
                    <DetailRow title='Permit ID' value={sortedPermits[0].id} />
                    <DetailRow title='Owner' value={sortedPermits[0].owner} />
                    <DetailRow title='Spender' value={sortedPermits[0].spender} />
                    <DetailRow title='Nonce' value={sortedPermits[0].nonce} />
                    <DetailRow title='Deadline (Unix)' value={sortedPermits[0].deadline.toString()} />
                    <DetailRow title='Signature V' value={sortedPermits[0].v.toString()} />
                    <DetailRow title='Signature R' value={sortedPermits[0].r} />
                    <DetailRow title='Signature S' value={sortedPermits[0].s} />
                    {sortedPermits[0].txHash && <DetailRow title='Transaction Hash' value={sortedPermits[0].txHash} />}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
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
          <span className='text-body-sm text-neutral-01 font-medium text-right mt-2'>
            Allowance left: <span className='text-base-black font-semibold'>{allowance}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default TokenPermitsList;
