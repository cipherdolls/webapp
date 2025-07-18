import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { formatModelName } from '~/utils/formatModelName';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import Tooltip from '~/components/ui/tooltip';
import { Icons } from '~/components/ui/icons';
import React from 'react';

const ChatEmbeddingJobCard = ({ message }: { message: Message }) => {
  const embeddingJob = message?.embeddingJob;

  return (
    <DataCard.Root>
      <div className='flex items-center gap-2'>
        {embeddingJob?.embeddingModel.error && (
          <Tooltip
            side={'top'}
            trigger={<Icons.warning className='size-5 text-specials-danger mb-4' />}
            content={embeddingJob.embeddingModel.error}
            popoverClassName='max-w-[320px]'
            className='max-w-[350px]'
          />
        )}

        <DataCard.Label>Embedding Job</DataCard.Label>
      </div>

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
