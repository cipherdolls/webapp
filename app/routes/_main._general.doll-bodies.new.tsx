import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.doll-bodies.new';
import DollBodyFormModal from '~/components/DollBodyFormModal';
import { useCreateDollBody } from '~/hooks/queries/dollBodyMutations';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Doll Body - CipherDolls' }];
}

export default function DollBodyNew() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(ROUTES.dollBodies);
  };

  const { mutate: createDollBody, isPending, error } = useCreateDollBody();

  const handleSubmit = (formData: FormData) => {
    createDollBody(formData, {
      onSuccess: (newDollBody) => {
        navigate(`${ROUTES.dollBodies}/${newDollBody.id}`);
      },
    });
  };

  return <DollBodyFormModal onSubmit={handleSubmit} isPending={isPending} onClose={handleClose} errors={error} />;
}
