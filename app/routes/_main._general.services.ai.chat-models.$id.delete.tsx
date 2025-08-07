import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.services.ai.chat-models.$id.edit';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
import { formatModelName } from '~/utils/formatModelName';
import { useDeleteChatModel } from '~/hooks/queries/aiProviderMutations';
import { useChatModel } from '~/hooks/queries/aiProviderQueries';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Delete Chat Model' }];
}

export default function ChatModelDelete({ params }: Route.ComponentProps) {
  const chatModelId = params.id;
  const { data: chatModel, isLoading: isLoadingChatModel } = useChatModel(chatModelId);
  const { mutate: deleteChatModel, isPending: isDeletingChatModel, error: deleteChatModelError } = useDeleteChatModel();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/services/ai`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    deleteChatModel(chatModelId, {
      onSuccess: () => handleClose(),
    });
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content>
        <Modal.Title className='sr-only'>Delete Chat Model</Modal.Title>
        <Modal.Description className='sr-only'>Delete Chat Model</Modal.Description>
        <form onSubmit={handleSubmit} className='size-full flex flex-col items-center justify-center'>
          <Modal.Body className='flex flex-col gap-3.5'>
            <h1 className='text-heading-h1 font-semibold text-center'>🗑️</h1>
            <div className='flex flex-col gap-2'>
              <h2 className='text-heading-h2 font-semibold text-center text-base-black'>
                Delete model {formatModelName(chatModel?.providerModelName)}?
              </h2>
              <span className='text-center text-base-black text-body-lg'>You will not be able to restore the data.</span>
            </div>
          </Modal.Body>
          <Modal.Footer className='w-full'>
            <Button.Root type='submit' variant='secondary' className='w-full'>
              Yes, Delete
            </Button.Root>

            <Modal.Close asChild>
              <Button.Root aria-label='Close' className='w-full'>
                No, Leave
              </Button.Root>
            </Modal.Close>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
