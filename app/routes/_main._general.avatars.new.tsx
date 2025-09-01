import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.avatars.new';
import AvatarFormModal from '~/components/AvatarFormModal';
import { useCreateAvatar } from '~/hooks/queries/avatarMutations';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatars' }];
}

export default function AvatarNew() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(ROUTES.avatars);
  };
  const {
    mutate: createAvatar,
    isPending: createAvatarIsPending,
    error: createAvatarError,
  } = useCreateAvatar();

  const handleSubmit = (formData: FormData) => {
    createAvatar(formData, {
      onSuccess: (newAvatarData) => {
        navigate(`${ROUTES.avatars}/${newAvatarData.id}`);
      },
    });
  };

  return (
    <AvatarFormModal
      onSubmit={handleSubmit}
      isPending={createAvatarIsPending}
      onClose={handleClose}
      errors={createAvatarError}
    />
  );
}
