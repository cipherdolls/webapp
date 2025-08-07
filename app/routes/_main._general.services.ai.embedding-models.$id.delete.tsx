import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.services.ai.embedding-models.$id.edit';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
import { formatModelName } from '~/utils/formatModelName';
import { useDeleteEmbeddingModel } from '~/hooks/queries/aiProviderMutations';
import { useEmbeddingModel } from '~/hooks/queries/aiProviderQueries';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { useEffect } from 'react';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Delete Embedding Model' }];
}

export default function EmbeddingModelDelete({ params }: Route.ComponentProps) {
  const { data: embeddingModel } = useEmbeddingModel(params.id);
  const { mutate: deleteEmbeddingModel, isPending: isDeletingEmbeddingModel, error: deleteEmbeddingModelError } = useDeleteEmbeddingModel();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const handleClose = () => {
    navigate(`/services/ai`, { replace: true });
  };

  useEffect(() => {
    const handleDelete = async () => {
      const result = await confirm({
        title: `Delete embedding model ${formatModelName(embeddingModel?.providerModelName)}?`,
        body: 'You will not be able to restore the data.',
        cancelButton: 'No, Leave',
        actionButton: 'Yes, Delete',
      });
      if (result) {
        deleteEmbeddingModel(params.id, {
          onSuccess: () => handleClose(),
        });
      }
    };
    if (embeddingModel) {
      handleDelete();
    }
  }, [embeddingModel]);


  return null
}
