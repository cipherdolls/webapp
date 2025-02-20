import { redirect } from "react-router";
import type { Scenario } from "~/types";
import type { Route } from "./+types/preferences.scenarios";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Scenarios" },
  ];
}


export async function clientLoader() {
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const headers = {
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
  };
  try {
    const res = await fetch(`${backendUrl}/scenarios`, headers);
    return await res.json();
  } catch (error) {
    console.error(error);
    return redirect('/signin');
  }
}

export default function ScenariosIndex({ loaderData }: Route.ComponentProps) {
  const scenarios: Scenario[] = loaderData;

  return (
    <>
      <div className="">
        Scenarios
      </div>
      {scenarios.map((scenario) => (
        <div key={scenario.id}>
          <h2>{scenario.name}</h2>
        </div>
      ))}
    </>


  );
}
