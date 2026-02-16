import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.services.ai.embedding-models.$id.edit';
import { formatModelName } from '~/utils/formatModelName';
import { useDeleteEmbeddingModel } from '~/hooks/queries/aiProviderMutations';
import { useEmbeddingModel } from '~/hooks/queries/aiProviderQueries';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { useEffect, useRef } from 'react';
import { ROUTES } from '~/constants';
import ErrorsBox from '~/components/ui/input/errorsBox';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Delete Embedding Model' }];
}

export default function EmbeddingModelDelete({ params }: Route.ComponentProps) {
  const { data: embeddingModel } = useEmbeddingModel(params.id);
  const { mutate: deleteEmbeddingModel } = useDeleteEmbeddingModel();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const hasTriggered = useRef(false);

  const handleClose = () => {
    navigate(`${ROUTES.services}/ai`, { replace: true });
  };

  useEffect(() => {
    if (!embeddingModel || hasTriggered.current) return;
    hasTriggered.current = true;

    const handleDelete = async () => {
      const result = await confirm({
        title: `Delete embedding model ${formatModelName(embeddingModel?.providerModelName)}?`,
        body: 'You will not be able to restore the data.',
        cancelButton: 'No, Leave',
        actionButton: 'Yes, Delete',
        variant: 'danger',
      });
      if (result) {
        deleteEmbeddingModel(params.id, {
          onSuccess: () => handleClose(),
          onError: async (error) => {
            await confirm({
              title: `Delete embedding model ${formatModelName(embeddingModel?.providerModelName)}?`,
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
  }, [embeddingModel]);

  return null;
}
