import { redirect, useFetcher, useNavigate, useRouteLoaderData } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { AiProvider, AiProvidersPaginated, Scenario, Gender, Avatar, AvatarsPaginated, User } from '~/types';
import type { Route } from './+types/_main._general._id.scenarios.$scenariosId.edit';
import ScenarioFormModal from '~/components/ScenarioFormModal';


export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Scenario' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const scenarioId = params.scenariosId;

  const [scenarioRes, aiProvidersRes, avatarsRes, publicAvatarsRes] = await Promise.all([
    fetchWithAuth(`scenarios/${scenarioId}`),
    fetchWithAuth('ai-providers'),
    fetchWithAuth('avatars'),
    fetchWithAuth('avatars?published=true'),
  ]);

  const scenario = await scenarioRes.json();
  const { data }: AiProvidersPaginated = await aiProvidersRes.json();
  const aiProviders = data;

  const mineAvatars: AvatarsPaginated = await avatarsRes.json();
  const publicAvatars: AvatarsPaginated = await publicAvatarsRes.json();

  const allAvatars = [...mineAvatars.data, ...publicAvatars.data];
  const avatars = allAvatars.filter((avatar, index, self) => index === self.findIndex((a) => a.id === avatar.id));

  return { scenario, aiProviders, avatars };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const scenarioId = formData.get('scenarioId');

    // Handle boolean conversion for published field
    const publishedValue = formData.get('published');
    if (publishedValue === 'true' || publishedValue === 'false') {
      formData.set('published', publishedValue);
    }

    const res = await fetchWithAuth(`scenarios/${scenarioId}`, {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      const responseData = await res.json();
      return {
        errors: responseData.message || 'Request failed',
      };
    }

    const scenario: Scenario = await res.json();
    return redirect(`/scenarios/${scenario.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function ScenarioEdit({ loaderData }: Route.ComponentProps) {
  const { scenario, aiProviders, avatars } = loaderData as { scenario: Scenario; aiProviders: AiProvider[]; avatars: Avatar[] };
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/scenarios/${scenario.id}`);
  };

  return (
    <ScenarioFormModal method='PATCH' scenario={scenario} aiProviders={aiProviders} avatars={avatars}  onClose={handleClose} />
  );
}
