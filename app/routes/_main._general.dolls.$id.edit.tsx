import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.dolls.$id.edit';
import DollFormModal from '~/components/DollFormModal';
import { useUpdateDoll } from '~/hooks/queries/dollMutations';
import { useDoll } from '~/hooks/queries/dollQueries';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Doll - CipherDolls' }];
}

export default function DollEdit({ params }: Route.ComponentProps) {
  const { data: doll } = useDoll(params.id);
  const { mutate: updateDoll, isPending, error } = useUpdateDoll();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`${ROUTES.dolls}/${params.id}`);
  };

  const handleSubmit = (formData: FormData) => {
    if (!doll) return;

    updateDoll(
      { dollId: doll.id, formData },
      {
        onSuccess: (updatedDoll) => {
          navigate(`${ROUTES.dolls}/${updatedDoll.id}`);
        },
      }
    );
  };

  if (!doll) return null;

  return <DollFormModal doll={doll} onSubmit={handleSubmit} isPending={isPending} onClose={handleClose} errors={error} />;
}
