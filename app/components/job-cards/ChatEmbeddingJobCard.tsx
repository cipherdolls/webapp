import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { formatModelName } from '~/utils/formatModelName';
import { scientificNumConvert } from '~/utils/scientificNumConvert';

const ChatEmbeddingJobCard = ({ message }: { message: Message }) => {
  const embeddingJob = message?.embeddingJob;

  return (
    <DataCard.Root>
      <DataCard.Label>Embedding Job</DataCard.Label>
      <DataCard.Wrapper>
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'AI Provider',
              value: embeddingJob.embeddingModel?.aiProvider.name,
            },
            {
              label: 'Embedding Model',
              value: formatModelName(embeddingJob.embeddingModel?.providerModelName),
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
