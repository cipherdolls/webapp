import { Outlet, redirect, useRouteLoaderData } from 'react-router';
import type { Scenario, User } from '~/types';
import type { Route } from './+types/_main._general.community.scenarios';
import { DataCard } from '~/components/DataCard';
import Table, { type TTableColumn } from '~/components/Table';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { ViewButton } from '~/components/preferencesViewButton';
import { formatModelName } from '~/utils/formatModelName';
import MyScenarios from '~/components/my-scenarios';
import PublicScenarios from '~/components/public-scenarios';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Scenarios' }];
}

export async function clientLoader() {
  const res = await fetchWithAuth(`scenarios`);
  return await res.json();
}

export default function ScenariosIndex({ loaderData }: Route.ComponentProps) {
  const scenarios: Scenario[] = loaderData;
  const me = useRouteLoaderData('routes/_main') as User;

  // const myScenarios = scenarios.filter((scenario) => scenario.userId === me.id);

  // const publicScenarios = scenarios.filter((scenario) => scenario.pub === me.id);

  return (
    <>
      <MyScenarios scenarios={scenarios} />
      <PublicScenarios scenarios={scenarios} />
      <Outlet />
    </>
  );
}
