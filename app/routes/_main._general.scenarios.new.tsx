import { redirect, useNavigate } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.scenarios.new';
import type { AiProvider, AiProvidersPaginated, Avatar, AvatarsPaginated } from '~/types';
import ScenarioFormModal from '~/components/ScenarioFormModal';

interface Option {
  label: string;
  value: string;
  recommended: boolean;
}

interface OptionGroup {
  groupName: string;
  options: Option[];
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Scenario' }];
}

export async function clientLoader() {
  const [aiProvidersRes, avatarsRes, publicAvatarsRes] = await Promise.all([
    fetchWithAuth('ai-providers'),
    fetchWithAuth('avatars'),
    fetchWithAuth('avatars?published=true'),
  ]);

  const { data }: AiProvidersPaginated = await aiProvidersRes.json();
  const aiProviders = data;

  const mineAvatars: AvatarsPaginated = await avatarsRes.json();
  const publicAvatars: AvatarsPaginated = await publicAvatarsRes.json();

  // Deduplicate avatars by ID
  const allAvatars = [...mineAvatars.data, ...publicAvatars.data];
  const avatars = allAvatars.filter((avatar, index, self) => index === self.findIndex((a) => a.id === avatar.id));

  return { aiProviders, avatars };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const res = await fetchWithAuth('scenarios', {
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
    return redirect(`/scenarios`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function ScenarioNew({ loaderData }: Route.ComponentProps) {
  const { aiProviders, avatars } = loaderData as { aiProviders: AiProvider[]; avatars: Avatar[] };
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/scenarios`);
  };


  return <ScenarioFormModal method='POST' onClose={handleClose} aiProviders={aiProviders} avatars={avatars} />;
}
