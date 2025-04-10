import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
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
              value: chatCompletionJob.chatModel.name,
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
      </DataCard.Wrapper>
    </DataCard.Root>
  );
};

export default ChatCompletionJobCard;
