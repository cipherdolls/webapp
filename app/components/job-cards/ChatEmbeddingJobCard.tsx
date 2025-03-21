import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { scientificNumConvert } from '~/utils/scientificNumConvert';

const ChatEmbeddingJobCard = ({ message }: { message: Message }) => {
  const embeddingJob = message?.embeddingJob;
  const embeddingModel = message?.chat?.scenario?.embeddingModel;

  return (
    <DataCard.Root>
      <DataCard.Label>Embedding Job</DataCard.Label>
      <DataCard.Wrapper>
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'AI Provider',
              value: embeddingModel.aiProvider.name,
            },
            {
              label: 'Embedding Model',
              value: embeddingModel.name,
            },
          ]}
        />
        <DataCard.Divider />
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'Time Taken',
              value: `${embeddingJob.timeTakenMs} ms`,
            },
            {
              label: 'Cost (USD)',
              value: `$${scientificNumConvert(embeddingJob.usdCost)}`,
            },
          ]}
        />
      </DataCard.Wrapper>
    </DataCard.Root>
  );
};

export default ChatEmbeddingJobCard;
