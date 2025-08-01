import { redirect, useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.avatars.new';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import AvatarFormModal from '~/components/AvatarFormModal';
import { useCreateAvatar } from '~/hooks/queries/avatarMutations';
import { useEffect } from 'react';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatars' }];
}


export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const res = await fetchWithAuth('avatars', {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      const responseData = await res.json();
      return {
        errors: responseData.message || 'Request failed',
      };
    }

    await res.json();
    return redirect(`/avatars?mine=true`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function AvatarNew({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/avatars');
  };
  const { mutate: createAvatar, isPending: createAvatarIsPending, error: createAvatarError, isSuccess: createAvatarIsSuccess } = useCreateAvatar();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createAvatar(new FormData(e.target as HTMLFormElement));
  };

  useEffect(() => {
    if (createAvatarIsSuccess) {
      navigate('/avatars?mine=true');
    }
  }, [createAvatarIsSuccess]);

  return (
    <AvatarFormModal
      onSubmit={handleSubmit}
      isPending={createAvatarIsPending}
      onClose={handleClose}
      errors={createAvatarError?.message}
    />
  );
}
