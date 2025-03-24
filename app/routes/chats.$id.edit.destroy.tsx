import { redirect, useSubmit } from 'react-router';
import type { Route } from './+types/chats.$id.edit.destroy';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { useConfirm } from '~/providers/AlertDialogProvider';
import * as Button from '~/components/ui/button/button';

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const chatId = params.id;
  const res = await fetchWithAuth(`chats/${chatId}`, {
    method: request.method,
  });

  if (!res.ok) {
    return await res.json();
  }

  return redirect(`/chats`);
}

export default function ChatDestroy() {
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
      submit(null, { method: 'DELETE', action: `destroy` });
    }
  };

  return (
    <Button.Root type='button' variant='danger' className='w-full px-10' onClick={handleMessageDestroy}>
      Delete Message
    </Button.Root>
  );
}
