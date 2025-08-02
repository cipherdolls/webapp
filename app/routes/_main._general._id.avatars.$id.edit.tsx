import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general._id.avatars.$id.edit';
import AvatarFormModal from '~/components/AvatarFormModal';
import { useUpdateAvatar } from '~/hooks/queries/avatarMutations';
import { useAvatar } from '~/hooks/queries/avatarQueries';

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
    navigate(`/avatars/${params.id}`);
  };

  const handleSubmit = (formData: FormData) => {
    updateAvatar(
      { avatarId: params.id, formData },
      {
        onSuccess: (updatedAvatar) => {
          navigate(`/avatars/${updatedAvatar.id}`);
        },
      }
    );
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
