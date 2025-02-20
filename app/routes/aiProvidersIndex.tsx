import { redirect } from "react-router";
import type { Route } from "./+types/aiProvidersIndex";
import type { AiProvider } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AiProviders" },
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
    const res = await fetch(`${backendUrl}/ai-providers`, headers);
    return await res.json();
  } catch (error) {
    console.error(error);
    return redirect('/signin');
  }
}

export default function AiProvidersIndex({ loaderData }: Route.ComponentProps) {
  const aiProviders: AiProvider[] = loaderData;
  return (
    <>
    <div className="">
        AiProviders
    </div>
    {aiProviders.map((aiProvider) => (
      <div key={aiProvider.id}>
        <h2>{aiProvider.name}</h2>
      </div>
    ))}
  </>
  );
}
