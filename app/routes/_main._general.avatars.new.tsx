import { redirect, useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.avatars.new';
import type { Scenario, ScenariosPaginated, TtsVoice } from '~/types';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import AvatarFormModal from '~/components/AvatarFormModal';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatars' }];
}



export async function clientLoader() {
  const [ttsVoicesRes, scenariosRes, publicScenariosRes] = await Promise.all([
    fetchWithAuth('tts-voices'),
    fetchWithAuth('scenarios'),
    fetchWithAuth('scenarios?published=true'),
  ]);

  const ttsVoices = await ttsVoicesRes.json();
  const mineScenarios: ScenariosPaginated = await scenariosRes.json();
  const publicScenarios: ScenariosPaginated = await publicScenariosRes.json();

  const scenarios = [...mineScenarios.data, ...publicScenarios.data];

  return { ttsVoices, scenarios };
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
  const { ttsVoices, scenarios }: { ttsVoices: TtsVoice[]; scenarios: Scenario[] } = loaderData;
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/avatars');
  };

  return (
    <AvatarFormModal
      ttsVoices={ttsVoices}
      scenarios={scenarios}
      method='POST'
      onClose={handleClose}
    />
  );
}
