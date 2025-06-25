import { formatEther } from 'ethers';
import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { formatModelName } from '~/utils/formatModelName';
import { scientificNumConvert } from '~/utils/scientificNumConvert';

const ChatCompletionJobCard = ({ message }: { message: Message }) => {
  const chatCompletionJob = message?.chatCompletionJob;

  return (
    <DataCard.Root>
      <DataCard.Label>Chat Completion Job</DataCard.Label>
      <DataCard.Wrapper>
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'AI Provider',
              value: chatCompletionJob.chatModel.aiProvider?.name,
            },
            {
              label: 'Chat Model',
              value: formatModelName(chatCompletionJob.chatModel.providerModelName),
            },
          ]}
        />
        <DataCard.Divider />
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'Input Tokens',
              value: scientificNumConvert(chatCompletionJob.inputTokens),
            },
            {
              label: 'Output Tokens',
              value: scientificNumConvert(chatCompletionJob.outputTokens),
            },
            {
              label: 'Total Tokens',
              value: scientificNumConvert(chatCompletionJob.totalTokens),
            },
            {
              label: 'Cost (USD)',
              value: `$${scientificNumConvert(chatCompletionJob.usdCost)}`,
            },
            {
              label: 'Time Taken',
              value: `${chatCompletionJob.timeTakenMs} ms`,
            },
          ]}
        />
        <DataCard.Divider />
        <DataCard.ItemLabel className='pb-4'>Payment Job</DataCard.ItemLabel>
        <DataCard.ItemDataGrid
          variant='secondary'
          data={[
            {
              label: 'Cost',
              value: `${formatEther(chatCompletionJob.paymentJob?.weiCost || 0)} Ether`,
            },
            {
              label: 'txHash',
              value: chatCompletionJob.paymentJob?.txHash ? (
                <>
                  <a
                    href={`https://optimistic.etherscan.io/tx/${chatCompletionJob.paymentJob?.txHash}`}
                    className='underline line-clamp-1 block truncate break-normal max-w-[244px]'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {chatCompletionJob.paymentJob.txHash}
                  </a>
                </>
              ) : (
              'N/A'
              ),
            },
          ]}
        />
      </DataCard.Wrapper>
    </DataCard.Root>
  );
};

export default ChatCompletionJobCard;
