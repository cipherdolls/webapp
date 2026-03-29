import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.doll-bodies.$id.edit';
import DollBodyFormModal from '~/components/DollBodyFormModal';
import { useUpdateDollBody } from '~/hooks/queries/dollBodyMutations';
import { useDollBody } from '~/hooks/queries/dollQueries';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Doll Body - CipherDolls' }];
}

export default function DollBodyEdit({ params }: Route.ComponentProps) {
  const { data: dollBody } = useDollBody(params.id);
  const { mutate: updateDollBody, isPending, error } = useUpdateDollBody();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`${ROUTES.dollBodies}/${params.id}`);
  };

  const handleSubmit = (formData: FormData) => {
    if (!dollBody) return;

    updateDollBody(
      { dollBodyId: dollBody.id, formData },
      {
        onSuccess: (updatedDollBody) => {
          navigate(`${ROUTES.dollBodies}/${updatedDollBody.id}`);
        },
      }
    );
  };

  if (!dollBody) return null;

  return <DollBodyFormModal dollBody={dollBody} onSubmit={handleSubmit} isPending={isPending} onClose={handleClose} errors={error} />;
}
