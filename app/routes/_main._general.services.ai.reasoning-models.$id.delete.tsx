import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.services.ai.reasoning-models.$id.delete';
import { formatModelName } from '~/utils/formatModelName';
import { useReasoningModel } from '~/hooks/queries/aiProviderQueries';
import { useDeleteReasoningModel } from '~/hooks/queries/aiProviderMutations';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { useEffect, useRef } from 'react';
import { ROUTES } from '~/constants';
import ErrorsBox from '~/components/ui/input/errorsBox';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Delete Reasoning Model' }];
}

export default function ReasoningModelDelete({ params }: Route.ComponentProps) {
  const { data: reasoningModel } = useReasoningModel(params.id);
  const { mutate: deleteReasoningModel } = useDeleteReasoningModel();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const hasTriggered = useRef(false);

  const handleClose = () => {
    navigate(`${ROUTES.services}/ai`, { replace: true });
  };

  useEffect(() => {
    if (!reasoningModel || hasTriggered.current) return;
    hasTriggered.current = true;

    const handleDelete = async () => {
      const result = await confirm({
        title: `Delete reasoning model ${formatModelName(reasoningModel?.providerModelName)}?`,
        body: 'You will not be able to restore the data.',
        cancelButton: 'No, Leave',
        actionButton: 'Yes, Delete',
        variant: 'danger',
      });
      if (result) {
        deleteReasoningModel(params.id, {
          onSuccess: () => handleClose(),
          onError: async (error) => {
            await confirm({
              title: `Delete reasoning model ${formatModelName(reasoningModel?.providerModelName)}?`,
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
  }, [reasoningModel]);

  return null;
}
