import { formatEther } from 'ethers';
import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { formatModelName } from '~/utils/formatModelName';
import { scientificNumConvert } from '~/utils/scientificNumConvert';

const ChatCompletionJobCard = ({ message }: { message: Message }) => {
  const chatCompletionJob = message?.chatCompletionJob;

  const formattedUsdCost = chatCompletionJob?.usdCost > 0 ? chatCompletionJob?.usdCost.toFixed(8) : 0;
  const formattedPaymentJob = chatCompletionJob.paymentJob?.weiCost ? formatEther(chatCompletionJob.paymentJob?.weiCost) : 0;

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
              label: 'Time Taken',
              value: `${chatCompletionJob.timeTakenMs} ms`,
            },
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
              value: `$${formattedUsdCost}`,
            },
          ]}
        />
      </DataCard.Wrapper>
    </DataCard.Root>
  );
};

export default ChatCompletionJobCard;
