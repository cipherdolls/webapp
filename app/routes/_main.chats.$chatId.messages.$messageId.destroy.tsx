import { redirect, useSubmit } from 'react-router';
import type { Route } from './+types/_main.chats.$chatId.messages.$messageId.destroy';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import * as Button from '~/components/ui/button/button';
import { useConfirm } from '~/providers/AlertDialogProvider';

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const res = await fetchWithAuth(`messages/${params.messageId}`, {
    method: request.method,
  });

  if (!res.ok) {
    return await res.json();
  }

  return redirect(`/chats/${params.chatId}`);
}

export default function MessageDestroy() {
  const confirm = useConfirm();
  const submit = useSubmit();

  const handleMessageDestroy = async () => {
    const confirmResult = await confirm({
      icon: '🗑️',
      title: 'Delete the Message?',
      body: 'All followed messages will be deleted as well',
      actionButton: 'Yes, Delete',
    });

    if (confirmResult) {
      submit(null, { method: 'DELETE', action: 'destroy' });
    }
  };

  return (
    <Button.Root type='button' variant='danger' className='w-full px-10' onClick={handleMessageDestroy}>
      Delete Message
    </Button.Root>
  );
}
