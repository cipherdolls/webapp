import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { formatModelName } from '~/utils/formatModelName';
import Tooltip from '~/components/ui/tooltip';
import { Icons } from '~/components/ui/icons';
import React from 'react';
import { formatEther } from 'ethers';

const ChatEmbeddingJobCard = ({ message }: { message: Message }) => {
  const embeddingJob = message?.embeddingJob;

  const formattedUsdCost = embeddingJob?.usdCost > 0 ? embeddingJob?.usdCost.toFixed(8) : 0;
  const formattedPaymentJob = embeddingJob.paymentJob?.weiCost ? formatEther(embeddingJob.paymentJob?.weiCost) : 0;

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
              value: `$${formattedUsdCost}`,
            },
          ]}
        />
      </DataCard.Wrapper>
    </DataCard.Root>
  );
};

export default ChatEmbeddingJobCard;
