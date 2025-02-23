import { Form, redirect } from "react-router";
import type { Route } from "./+types/_main.avatars.new";
import type { TtsVoice } from "~/types";


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
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}


export default function AvatarNew({ loaderData }: Route.ComponentProps) {
  const ttsVoices: TtsVoice[] = loaderData;
  return (
    <>
      <div className="">
          Avatar New
      </div> 

      <Form method='post' action="/avatars/new" encType='multipart/form-data'>
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
      </Form>
    </>
  );
}
