import { formatUnits } from 'ethers';
import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { formatModelName } from '~/utils/formatModelName';
import { scientificNumConvert } from '~/utils/scientificNumConvert';

const ChatCompletionJobCard = ({ message }: { message: Message }) => {
  const chatCompletionJob = message?.chatCompletionJob;

  if (!chatCompletionJob || !chatCompletionJob.chatModel) {
    return (
      <DataCard.Root>
        <DataCard.Label>Chat Completion Job</DataCard.Label>
        <DataCard.Wrapper>
          <p className='text-body-sm text-neutral-01 p-5 text-center'>No job data yet</p>
        </DataCard.Wrapper>
      </DataCard.Root>
    );
  }

  const { usdCost, paymentJob, chatModel, timeTakenMs, inputTokens, outputTokens, totalTokens } = chatCompletionJob;
  const formattedUsdCost = Number(usdCost) > 0 ? Number(usdCost).toFixed(8) : 0;
  const formattedPaymentJob = paymentJob?.weiCost ? formatUnits(paymentJob.weiCost, 6) : 0;

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
              value: timeTakenMs ? `${timeTakenMs} ms` : '--',
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
      </DataCard.Wrapper>
    </DataCard.Root>
  );
};

export default ChatCompletionJobCard;
