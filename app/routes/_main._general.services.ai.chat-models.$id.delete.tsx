import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.services.ai.chat-models.$id.edit';
import { formatModelName } from '~/utils/formatModelName';
import { useDeleteChatModel } from '~/hooks/queries/aiProviderMutations';
import { useChatModel } from '~/hooks/queries/aiProviderQueries';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { useEffect, useRef } from 'react';
import { ROUTES } from '~/constants';
import ErrorsBox from '~/components/ui/input/errorsBox';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Delete Chat Model' }];
}

export default function ChatModelDelete({ params }: Route.ComponentProps) {
  const chatModelId = params.id;
  const { data: chatModel } = useChatModel(chatModelId);
  const { mutate: deleteChatModel } = useDeleteChatModel();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const hasTriggered = useRef(false);

  const handleClose = () => {
    navigate(`${ROUTES.services}/ai`, { replace: true });
  };

  useEffect(() => {
    if (!chatModel || hasTriggered.current) return;
    hasTriggered.current = true;

    const handleDelete = async () => {
      const result = await confirm({
        title: `Delete chat model ${formatModelName(chatModel?.providerModelName)}?`,
        body: 'You will not be able to restore the data.',
        cancelButton: 'No, Leave',
        actionButton: 'Yes, Delete',
        variant: 'danger',
      });
      if (result) {
        deleteChatModel(chatModelId, {
          onSuccess: () => handleClose(),
          onError: async (error) => {
            await confirm({
              title: `Delete chat model ${formatModelName(chatModel?.providerModelName)}?`,
              body: (
                <div className='flex flex-col gap-3'>
                  <ErrorsBox errors={error} />
                  <p className='text-center'>You will not be able to restore the data.</p>
                </div>
              ),
              cancelButton: 'Close',
              actionButton: 'Retry',
              variant: 'danger',
            });
            handleClose();
          },
        });
      } else {
        handleClose();
      }
    };

    handleDelete();
  }, [chatModel]);

  return null;
}
