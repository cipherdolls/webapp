import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { formatEther } from 'ethers';

const ChatTTSJobCard = ({ message }: { message: Message }) => {
  const ttsJob = message?.ttsJob;

  return (
    <DataCard.Root>
      <DataCard.Label>TTS Job</DataCard.Label>
      <DataCard.Wrapper>
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'TTS Provider',
              value: ttsJob?.ttsVoice?.ttsProvider?.name ?? 'N/A',
            },
            {
              label: 'TTS Voice',
              value: ttsJob?.ttsVoice?.name ?? 'N/A',
            },
          ]}
        />
        <DataCard.Divider />
        <DataCard.ItemDataGrid
          data={[
            {
              label: 'Time Taken',
              value: ttsJob?.timeTakenMs ? `${ttsJob.timeTakenMs} ms` : '--',
            },
            {
              label: 'Cost (USD)',
              value: `$${scientificNumConvert(ttsJob?.usdCost ?? 0)}`,
            },
          ]}
        />
        {/*<DataCard.Divider />*/}
        {/*<DataCard.ItemLabel className='pb-4'>Payment Job</DataCard.ItemLabel>*/}
      </DataCard.Wrapper>
    </DataCard.Root>
  );
};

export default ChatTTSJobCard;
