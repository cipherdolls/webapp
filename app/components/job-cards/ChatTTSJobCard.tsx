import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { etherWeiConverter } from '~/utils/etherWeiConverter';

const ChatTTSJobCard = ({ message }: { message: Message }) => {
  const ttsVoice = message?.chat?.avatar?.ttsVoice;
  const ttsJob = message?.ttsJob;

  return (
    <DataCard.Root>
      <DataCard.Label>TTS Job</DataCard.Label>
      <DataCard.Wrapper>
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'TTS Provider',
              value: ttsVoice.ttsProvider.name,
            },
            {
              label: 'TTS Voice',
              value: ttsVoice.name,
            },
          ]}
        />
        <DataCard.Divider />
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'Time Taken',
              value: `${ttsJob.timeTakenMs} ms`,
            },
            {
              label: 'Cost (USD)',
              value: `$${scientificNumConvert(ttsJob.usdCost)}`,
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
              value: `${etherWeiConverter(ttsJob.paymentJob.weiCost)} Ether`,
            },
            {
              label: 'txHash',
              value: ttsJob.paymentJob.txHash ? (
                <>
                  <a
                    href={`https://optimistic.etherscan.io/tx/${ttsJob.paymentJob.txHash}`}
                    className='underline line-clamp-1 block truncate break-normal max-w-[244px]'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {ttsJob.paymentJob.txHash}
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

export default ChatTTSJobCard;
