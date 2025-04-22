import { DataCard } from '~/components/DataCard';
import type { Message } from '~/types';
import { scientificNumConvert } from '~/utils/scientificNumConvert';

const ChatSTTJobCard = ({ message }: { message: Message }) => {
  const sttJob = message?.sttJob;
  return (
    <DataCard.Root>
      <DataCard.Label>STT Job</DataCard.Label>
      <DataCard.Wrapper>
        <DataCard.ItemDataGrid data={[
          {
            label: 'STT Provider',
            value: sttJob.sttProvider?.name,
          },         
         ]} />
         <DataCard.Divider />
         <DataCard.ItemDataGrid data={[
          {
            label: 'Time Taken',
            value: `${sttJob.timeTakenMs} ms`,
          },
          {
            label: 'Cost (USD)',
            value: `$${scientificNumConvert(sttJob.usdCost)}`,
          },
         ]} />
      </DataCard.Wrapper>
    </DataCard.Root>
  );
};

export default ChatSTTJobCard