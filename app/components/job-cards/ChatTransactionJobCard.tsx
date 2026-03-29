import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { useTransactions } from '~/hooks/queries/transactionQueries';

import { formatUnits } from 'ethers';
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
  const { data: transactions, isLoading } = useTransactions(message.id);

  if (isLoading) {
    return null;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <DataCard.Root>
        <DataCard.Label>Transactions</DataCard.Label>
        <DataCard.Wrapper>
          <div className='text-center py-4 text-neutral-01'>No transactions found</div>
        </DataCard.Wrapper>
      </DataCard.Root>
    );
  }

  return (
    <DataCard.Root>
      <DataCard.Label>Transactions</DataCard.Label>
      <DataCard.Wrapper>
        <Accordion.Root type='single' collapsible className='w-full'>
          {transactions.map((transaction, index) => (
            <Accordion.Item key={index} value={transaction.id}>
              {index > 0 && <DataCard.Divider />}

              <Accordion.Trigger
                className={`flex items-center justify-between w-full px-3 md:px-5 pt-4 text-body-md font-semibold text-base-black data-[state=open]:bg-neutral-05 data-[state=closed]:hover:opacity-70 transition-all duration-200 ${index === transactions.length - 1 ? 'pb-4' : 'pb-2'}`}
              >
                <div className='flex items-center gap-2'>
                  <span>{formatTransactionType(transaction.type)}</span>
                  {transaction.error && <Icons.warning className='size-4 text-specials-danger' />}
                </div>
                <Icons.chevronDown className='h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180' />
              </Accordion.Trigger>
              <Accordion.Content className='overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
                <div className=''>
                  <DataCard.ItemDataGrid
                    className='bg-neutral-05 '
                    variant='default'
                    data={[
                      {
                        label: 'Amount',
                        value: `${formatUnits(transaction.amountWei, 6)} USDC`,
                      },
                      {
                        label: 'From Address',
                        value: transaction.fromAddress ? (
                          <a
                            href={`https://basescan.org/address/${transaction.fromAddress}`}
                            className='underline'
                            target='_blank'
                            rel='noreferrer noopener'
                          >
                            {transaction.fromAddress.slice(0, 6)}...
                          </a>
                        ) : 'N/A'
                      },
                      {
                        label: 'To Address',
                        value: transaction.toAddress ? (
                          <a
                            href={`https://basescan.org/address/${transaction.toAddress}`}
                            className='underline'
                            target='_blank'
                            rel='noreferrer noopener'
                          >
                            {transaction.toAddress.slice(0, 6)}...
                          </a>
                        ) : 'N/A'
                      },
                      {
                        label: 'Time Taken',
                        value: transaction.timeTakenMs ? `${transaction.timeTakenMs} ms` : '--',
                      },
                      // {
                      //   label: 'Nonce',
                      //   value: transaction.nonce?.toString() ?? 0,
                      // },
                      {
                        label: 'Transaction Hash',
                        value: transaction.txHash ? (
                          <a
                            href={`https://basescan.org/tx/${transaction.txHash}`}
                            className='underline'
                            target='_blank'
                            rel='noreferrer noopener'
                          >
                            {transaction.txHash.slice(0, 6)}...
                          </a>
                        ) : (
                          'N/A'
                        )
                      },
                      // {
                      //   label: 'Status',
                      //   value: transaction.error ? (
                      //     <span className='text-specials-danger font-medium'>Error: {formatTransactionType(transaction.type)} - {formattedErrorsWithAuth(transaction.error)}</span>
                      //   ) : (
                      //     <span className='text-specials-success font-medium'>Success</span>
                      //   ),
                      // },
                    ]}
                  />
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </DataCard.Wrapper>
    </DataCard.Root>
  );
};

export default ChatTransactionJobCard;
