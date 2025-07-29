import { redirect, useNavigate } from 'react-router';
import type { Route } from './+types/_main._general._id.avatars.$id.edit';
import type { Avatar, ScenariosPaginated, TtsVoice } from '~/types';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import AvatarFormModal from '~/components/AvatarFormModal';


export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatar edit' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const avatarId = params.id;
  const [avatarRes, ttsVoicesRes, scenariosRes, publicScenariosRes] = await Promise.all([
    fetchWithAuth(`avatars/${avatarId}`),
    fetchWithAuth('tts-voices'),
    fetchWithAuth('scenarios'),
    fetchWithAuth('scenarios?published=true'),
  ]);

  const avatar: Avatar = await avatarRes.json();
  const ttsVoices: TtsVoice[] = await ttsVoicesRes.json();
  const mineScenarios: ScenariosPaginated = await scenariosRes.json();
  const publicScenarios: ScenariosPaginated = await publicScenariosRes.json();

  const scenarios = [...mineScenarios.data, ...publicScenarios.data];

  return { avatar, ttsVoices, scenarios };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const avatarId = formData.get('avatarId');

    const res = await fetchWithAuth(`avatars/${avatarId}`, {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      const responseData = await res.json();
      return {
        errors: responseData.message || 'Request failed',
      };
    }

    const avatar: Avatar = await res.json();
    return redirect(`/avatars/${avatar.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function AvatarEdit({ loaderData }: Route.ComponentProps) {
  const { avatar, ttsVoices, scenarios } = loaderData;
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/avatars/${avatar.id}`);
  };

  return (
    <AvatarFormModal
      avatar={avatar}
      ttsVoices={ttsVoices}
      scenarios={scenarios}
      method='PATCH'
      onClose={handleClose}
    />
  );
}
