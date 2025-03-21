import { useSubmit } from 'react-router';
import { useConfirm } from '~/providers/AlertDialogProvider';
import * as Button from '~/components/ui/button/button';

const ChatDeleteButton = ({ chatId }: { chatId: string }) => {
  const confirm = useConfirm();
  const submit = useSubmit();

  const handleMessageDestroy = async () => {
    const confirmResult = await confirm({
      icon: '🗑️',
      title: 'Delete the Chats?',
      body: 'You will no able to restore the data',
      actionButton: 'Yes, Delete',
    });

    if (confirmResult) {
      submit(null, { method: 'DELETE', action: `/chats/${chatId}/destroy` });
    }
  };

  return (
    <Button.Root type='button' variant='danger' className='w-full px-10' onClick={handleMessageDestroy}>
      Delete Message
    </Button.Root>
  );
};

export default ChatDeleteButton;
