import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general._id.avatars.$id.edit';
import AvatarFormModal from '~/components/AvatarFormModal';
import { useUpdateAvatar } from '~/hooks/queries/avatarMutations';
import { useAvatar } from '~/hooks/queries/avatarQueries';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatar edit' }];
}

export default function AvatarEdit({ params }: Route.ComponentProps) {
  const { data: avatar } = useAvatar(params.id);

  const {
    mutate: updateAvatar,
    isPending: updateAvatarIsPending,
    error: updateAvatarError,
    isSuccess: updateAvatarIsSuccess,
  } = useUpdateAvatar();

  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`${ROUTES.avatars}/${params.id}`);
  };

  const handleSubmit = (formData: FormData) => {
    if (!avatar) return;

    updateAvatar({ avatarId: avatar.id, formData: formData }, {
      onSuccess: (updatedAvatar) => {
        navigate(`${ROUTES.avatars}/${updatedAvatar.id}`);
      },
    });
  };

  if (!avatar) return null;
  return (
    <AvatarFormModal
      avatar={avatar}
      onSubmit={handleSubmit}
      isPending={updateAvatarIsPending}
      onClose={handleClose}
      errors={updateAvatarError}
    />
  );
}
