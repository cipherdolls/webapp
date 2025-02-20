import { redirect } from "react-router";
import type { Route } from "./+types/ttsProvidersIndex";
import type { TtsProvider } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TTS Providers" },
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
    const res = await fetch(`${backendUrl}/tts-providers`, headers);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}



export default function TtsProvidersIndex({ loaderData }: Route.ComponentProps) {
  const ttsProviders: TtsProvider[]= loaderData;

  return (
    <>
      <div className="">
        TtsProviders
      </div>
      {ttsProviders.map((ttsProvider) => (
        <div key={ttsProvider.id}>
          <h2>{ttsProvider.name}</h2>
        </div>
      ))}

    </>

  );
}
