import { formatEther } from 'ethers';
import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { formatModelName } from '~/utils/formatModelName';
import { scientificNumConvert } from '~/utils/scientificNumConvert';

const ChatCompletionJobCard = ({ message }: { message: Message }) => {
  const { usdCost, paymentJob, chatModel, timeTakenMs, inputTokens, outputTokens, totalTokens } = message?.chatCompletionJob;

  if (!message?.chatCompletionJob.chatModel) {
    return (
      <DataCard.Root>
        <DataCard.Label>Chat Completion Job</DataCard.Label>
        <DataCard.Wrapper>
          <p className='text-body-sm text-neutral-01 p-5 text-center'>No job data yet</p>
        </DataCard.Wrapper>
      </DataCard.Root>
    );
  }

  const formattedUsdCost = usdCost > 0 ? usdCost.toFixed(8) : 0;
  const formattedPaymentJob = paymentJob?.weiCost ? formatEther(paymentJob?.weiCost) : 0;

  return (
    <DataCard.Root>
      <DataCard.Label>Chat Completion Job</DataCard.Label>
      <DataCard.Wrapper>
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'AI Provider',
              value: chatModel.aiProvider?.name,
            },
            {
              label: 'Chat Model',
              value: formatModelName(chatModel.providerModelName),
            },
          ]}
        />
        <DataCard.Divider />
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'Time Taken',
              value: `${timeTakenMs} ms`,
            },
            {
              label: 'Input Tokens',
              value: scientificNumConvert(inputTokens),
            },
            {
              label: 'Output Tokens',
              value: scientificNumConvert(outputTokens),
            },
            {
              label: 'Total Tokens',
              value: scientificNumConvert(totalTokens),
            },
            {
              label: 'Cost (USD)',
              value: `$${formattedUsdCost}`,
            },
          ]}
        />
        <DataCard.ItemDataGrid
          variant='secondary'
          data={[
            {
              label: 'Cost',
              value: `${formattedPaymentJob} LOV`,
            },
            {
              label: 'txHash',
              value: paymentJob?.txHash ? (
                <>
                  <a
                    href={`https://optimistic.etherscan.io/tx/${paymentJob?.txHash}`}
                    className='underline line-clamp-1 block truncate break-normal max-w-[244px]'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {paymentJob.txHash}
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
