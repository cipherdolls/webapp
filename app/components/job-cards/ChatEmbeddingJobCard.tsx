import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { formatModelName } from '~/utils/formatModelName';
import Tooltip from '~/components/ui/tooltip';
import { Icons } from '~/components/ui/icons';
import React from 'react';
import { formatUnits } from 'ethers';

const ChatEmbeddingJobCard = ({ message }: { message: Message }) => {
  const embeddingJob = message?.embeddingJob;

  if (!embeddingJob) {
    return null;
  }

  const formattedUsdCost = embeddingJob?.usdCost > 0 ? embeddingJob?.usdCost.toFixed(8) : 0;
  const formattedPaymentJob = embeddingJob?.paymentJob?.weiCost ? formatUnits(embeddingJob.paymentJob.weiCost, 6) : 0;

  return (
    <DataCard.Root>
      <div className='flex items-center gap-2'>
        <DataCard.Label>Embedding Job</DataCard.Label>

        {embeddingJob?.embeddingModel?.error && (
          <Tooltip
            side='top'
            variant='error'
            trigger={<Icons.warning className='size-5 text-specials-danger mb-4' />}
            content={embeddingJob.embeddingModel.error}
            popoverClassName='max-w-[320px]'
            className='max-w-[350px]'
          />
        )}
      </div>

      <DataCard.Wrapper>
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'AI Provider',
              value: embeddingJob?.embeddingModel?.aiProvider?.name ?? 'N/A',
            },
            {
              label: 'Embedding Model',
              value: embeddingJob?.embeddingModel?.providerModelName ? formatModelName(embeddingJob.embeddingModel.providerModelName) : 'N/A',
            },
          ]}
        />
        <DataCard.Divider />
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'Time Taken',
              value: embeddingJob?.timeTakenMs ? `${embeddingJob.timeTakenMs} ms` : '--',
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

export default ChatEmbeddingJobCard;
