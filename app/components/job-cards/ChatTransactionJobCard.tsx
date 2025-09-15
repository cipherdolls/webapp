import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { useTransactionLegs } from '~/hooks/queries/transactionQueries';

import { formatEther } from 'ethers';
import { Icons } from '~/components/ui/icons';
import * as Accordion from '@radix-ui/react-accordion';

export function formatTransactionType(type: string): string {
  return type
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const ChatTransactionJobCard = ({ message }: { message: Message }) => {
  const transactionJob = message?.transactionJob;
  const { data: transactionLegs, isLoading } = useTransactionLegs(transactionJob?.id || '');

  if (!transactionJob || isLoading) {
    return null;
  }

  if (!transactionLegs || transactionLegs.length === 0) {
    return (
      <DataCard.Root>
        <DataCard.Label>Transaction Job</DataCard.Label>
        <DataCard.Wrapper>
          <div className='text-center py-4 text-neutral-01'>No transaction legs found</div>
        </DataCard.Wrapper>
      </DataCard.Root>
    );
  }

  return (
    <DataCard.Root>
      <DataCard.Label>Transaction Job</DataCard.Label>
      <DataCard.Wrapper>
        {transactionLegs.map((leg, index) => (
          <div key={leg.id}>
            {index > 0 && <DataCard.Divider />}
            <Accordion.Root type='single' collapsible className='w-full'>
              <Accordion.Item value='details'>
                <Accordion.Trigger
                  className={`flex items-center justify-between w-full px-3 md:px-5 pt-4 text-body-md font-semibold text-base-black hover:opacity-70 transition-opacity ${index === transactionLegs.length - 1 ? 'pb-4' : 'pb-2'}`}
                >
                  <div className='flex items-center gap-2'>
                    <span>{formatTransactionType(leg.type)}</span>
                    {leg.error && <Icons.warning className='size-4 text-specials-danger' />}
                  </div>
                  <Icons.chevronDown className='h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180' />
                </Accordion.Trigger>
                <Accordion.Content className='overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
                  <div className='pb-4'>
                    <DataCard.ItemDataGrid
                      data={[
                        {
                          label: 'Amount',
                          value: `${formatEther(leg.amountWei)} ETH`,
                        },
                        {
                          label: 'To Address',
                          value: <span className='line-clamp-1 block truncate break-normal max-w-[244px]'>{leg.to}</span>,
                        },
                        {
                          label: 'Time Taken',
                          value: `${leg.timeTakenMs} ms`,
                        },
                        {
                          label: 'Nonce',
                          value: leg.nonce.toString(),
                        },
                      ]}
                    />
                    <DataCard.ItemDataGrid
                      variant='secondary'
                      data={[
                        {
                          label: 'Transaction Hash',
                          value: leg.txHash ? (
                            <a
                              href={`https://optimistic.etherscan.io/tx/${leg.txHash}`}
                              className='underline line-clamp-1 block truncate break-normal max-w-[244px]'
                              target='_blank'
                              rel='noreferrer noopener'
                            >
                              {leg.txHash}
                            </a>
                          ) : (
                            'N/A'
                          ),
                        },
                        {
                          label: 'Status',
                          value: leg.error ? (
                            <span className='text-specials-danger font-medium'>Error: {leg.error}</span>
                          ) : (
                            <span className='text-specials-success font-medium'>Success</span>
                          ),
                        },
                      ]}
                    />
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        ))}
      </DataCard.Wrapper>
    </DataCard.Root>
  );
};

export default ChatTransactionJobCard;
