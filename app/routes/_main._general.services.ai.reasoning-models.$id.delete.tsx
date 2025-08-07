import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.services.ai.reasoning-models.$id.delete';
import { formatModelName } from '~/utils/formatModelName';
import { useReasoningModel } from '~/hooks/queries/aiProviderQueries';
import { useDeleteReasoningModel } from '~/hooks/queries/aiProviderMutations';
import { useEffect } from 'react';
import { useConfirm } from '~/providers/AlertDialogProvider';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Delete Reasoning Model' }];
}


export default function ReasoningModelDelete({ params }: Route.ComponentProps) {
  const { data: reasoningModel } = useReasoningModel(params.id);
  const { mutate: deleteReasoningModel, isPending: isDeletingReasoningModel, error: deleteReasoningModelError } = useDeleteReasoningModel();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const handleClose = () => {
    navigate(`/services/ai`, { replace: true });
  };


  useEffect(() => {
    const handleDelete = async () => {
      const result = await confirm({
        title: `Delete reasoning model ${formatModelName(reasoningModel?.providerModelName)}?`,
        body: 'You will not be able to restore the data.',
        cancelButton: 'No, Leave',
        actionButton: 'Yes, Delete',
      });
      if (result) {
        deleteReasoningModel(params.id, {
          onSuccess: () => handleClose(),
        });
      }
    };
    if (reasoningModel) {
      handleDelete();
    }
  }, [reasoningModel]);
  

  return null;
}