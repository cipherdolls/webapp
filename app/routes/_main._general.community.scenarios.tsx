import { Outlet, useRouteLoaderData } from 'react-router';
import type { Scenario, User, Avatar } from '~/types';
import type { Route } from './+types/_main._general.community.scenarios';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import MyScenarios from '~/components/my-scenarios';
import PublicScenarios from '~/components/public-scenarios';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Scenarios' }];
}

export async function clientLoader() {
  const [scenariosRes, avatarsRes] = await Promise.all([fetchWithAuth('scenarios'), fetchWithAuth('avatars')]);

  const scenarios = await scenariosRes.json();
  const avatars = await avatarsRes.json();

  return { scenarios, avatars };
}

export default function ScenariosIndex({ loaderData }: Route.ComponentProps) {
  const { scenarios, avatars }: { scenarios: Scenario[]; avatars: Avatar[] } = loaderData;
  const me = useRouteLoaderData('routes/_main') as User;

  const myScenarios = scenarios.filter((scenario) => scenario.userId === me.id);

  // const publicScenarios = scenarios.filter((scenario) => scenario.pub === me.id);

  const myAvatars = avatars.filter((avatar) => avatar.userId === me.id);

  return (
    <>
      <MyScenarios scenarios={myScenarios} />
      <PublicScenarios scenarios={scenarios} avatars={myAvatars} />
      <Outlet />
    </>
  );
}
