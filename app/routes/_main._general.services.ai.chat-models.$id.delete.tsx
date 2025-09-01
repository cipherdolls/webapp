import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.services.ai.chat-models.$id.edit';
import { formatModelName } from '~/utils/formatModelName';
import { useDeleteChatModel } from '~/hooks/queries/aiProviderMutations';
import { useChatModel } from '~/hooks/queries/aiProviderQueries';
import { useEffect } from 'react';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Delete Chat Model' }];
}

export default function ChatModelDelete({ params }: Route.ComponentProps) {
  const chatModelId = params.id;
  const { data: chatModel, isLoading: isLoadingChatModel } = useChatModel(chatModelId);
  const { mutate: deleteChatModel, isPending: isDeletingChatModel, error: deleteChatModelError } = useDeleteChatModel();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const handleClose = () => {
    navigate(`${ROUTES.services}/ai`, { replace: true });
  };

  useEffect(() => {
    const handleDelete = async () => {
      const result = await confirm({
        title: `Delete chat model ${formatModelName(chatModel?.providerModelName)}?`,
        body: 'You will not be able to restore the data.',
        cancelButton: 'No, Leave',
        actionButton: 'Yes, Delete',
      });
      if (result) {
        deleteChatModel(params.id, {
          onSuccess: () => handleClose(),
        });
      }
    };
    if (chatModel) {
      handleDelete();
    }
  }, [chatModel]);

  return null;
}
