import { Form, redirect, useFetcher } from "react-router";
import type { Route } from "./+types/_main.avatars.new";
import type { Avatar, TtsVoice } from "~/types";
import { use, useEffect } from "react";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Avatars" },
  ];
}


export async function clientLoader() {
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const options = {
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
  };
  try {
    const res = await fetch(`${backendUrl}/tts-voices`, options);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}


export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
    body: formData,
  };
  try {
    const res = await fetch(`${backendUrl}/avatars`, options);

    if (!res.ok) {
      return await res.json();
    }
    const avatar: Avatar = await res.json();
    return redirect(`/avatars/${avatar.id}`);
  } catch (error: any) {
    console.error(error)
  }
}


export default function AvatarNew({ loaderData }: Route.ComponentProps) {
  const ttsVoices: TtsVoice[] = loaderData;
  const fetcher = useFetcher();
  

  return (
    <>
      <div className="">
          Avatar New
      </div> 

      {fetcher.data?.error && (
        <div className="error">
          {fetcher.data.message}
        </div>
      )}

      <fetcher.Form method='post' action="/avatars/new" encType='multipart/form-data'>

        <input name='name' id='name' placeholder='Name' />
        <input name='shortDesc' id='shortDesc' placeholder='shortDesc' />
        <input name='character' id='character' placeholder='character' />

        <input name='picture' id="picture"  type='file' />
        <select name='ttsVoiceId' id='ttsVoiceId'>
          {ttsVoices.map((ttsVoice) => (
            <option key={ttsVoice.id} value={ttsVoice.id}>
              {ttsVoice.name}
            </option>
          ))}
        </select>

        <button type='submit' >
            Create
        </button>
      </fetcher.Form>
    </>
  );
}
