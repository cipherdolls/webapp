import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { useTransactions } from '~/hooks/queries/transactionQueries';

import { formatEther } from 'ethers';
import { Icons } from '~/components/ui/icons';
import * as Accordion from '@radix-ui/react-accordion';
import { useUser } from '~/hooks/queries/userQueries';

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
  const { data: user } = useUser();
  const isAdmin = user?.role === 'ADMIN';

  function formattedErrorsWithAuth(error: string): string {
    if (isAdmin) {
      return error
    }

    return 'Something went wrong. Please tell Cipherdolls support about this problem.';
  }

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
        {transactions.map((transaction, index) => (
          <div key={transaction.id}>
            {index > 0 && <DataCard.Divider />}
            <Accordion.Root type='single' collapsible className='w-full'>
              <Accordion.Item value='details'>
                <Accordion.Trigger
                  className={`flex items-center justify-between w-full px-3 md:px-5 pt-4 text-body-md font-semibold text-base-black hover:opacity-70 transition-opacity ${index === transactions.length - 1 ? 'pb-4' : 'pb-2'}`}
                >
                  <div className='flex items-center gap-2'>
                    <span>{formatTransactionType(transaction.type)}</span>
                    {transaction.error && <Icons.warning className='size-4 text-specials-danger' />}
                  </div>
                  <Icons.chevronDown className='h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180' />
                </Accordion.Trigger>
                <Accordion.Content className='overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
                  <div className='pb-4'>
                    <DataCard.ItemDataGrid
                      data={[
                        {
                          label: 'Amount',
                          value: `${formatEther(transaction.amountWei)} ETH`,
                        },
                        {
                          label: 'From Address',
                          value: <span className='line-clamp-1 block truncate break-normal max-w-[244px]'>{transaction.fromAddress}</span>,
                        },
                        {
                          label: 'To Address',
                          value: <span className='line-clamp-1 block truncate break-normal max-w-[244px]'>{transaction.toAddress}</span>,
                        },
                        {
                          label: 'Time Taken',
                          value: transaction.timeTakenMs ? `${transaction.timeTakenMs} ms` : '--',
                        },
                        {
                          label: 'Nonce',
                          value: transaction.nonce?.toString() ?? 0,
                        },
                      ]}
                    />
                    <DataCard.ItemDataGrid
                      variant='secondary'
                      data={[
                        {
                          label: 'Transaction Hash',
                          value: transaction.txHash ? (
                            <a
                              href={`https://optimistic.etherscan.io/tx/${transaction.txHash}`}
                              className='underline line-clamp-1 block truncate break-normal max-w-[244px]'
                              target='_blank'
                              rel='noreferrer noopener'
                            >
                              {transaction.txHash}
                            </a>
                          ) : (
                            'N/A'
                          ),
                        },
                        {
                          label: 'Status',
                          value: transaction.error ? (
                            <span className='text-specials-danger font-medium'>Error: {formatTransactionType(transaction.type)} - {formattedErrorsWithAuth(transaction.error)}</span>
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
