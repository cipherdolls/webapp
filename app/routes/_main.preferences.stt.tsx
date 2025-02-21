import { redirect } from "react-router";
import type { SttProvider } from "~/types";
import type { Route } from "./+types/_main.preferences.stt";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "STT Providers" },
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
    const res = await fetch(`${backendUrl}/stt-providers`, headers);
    return await res.json();
  } catch (error) {
    console.error(error);
    return redirect('/signin');
  }
}

export default function SttProvidersIndex({ loaderData }: Route.ComponentProps) {
  const sttProviders: SttProvider[] = loaderData;
  return (
    <>
        <div className="">
          SttProviders
        </div>
        {sttProviders.map((sttProvider) => (
          <div key={sttProvider.id}>
            <h2>{sttProvider.name}</h2>
          </div>
        ))}
    </>

  );
}
