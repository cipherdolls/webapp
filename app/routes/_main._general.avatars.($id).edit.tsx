import { redirect, useFetcher } from "react-router";
import type { Route } from "./+types/_main._general.avatars.($id).edit";
import type { Avatar } from "~/types";
import { fetchWithAuth } from "~/utils/fetchWithAuth";



export function meta({}: Route.MetaArgs) {
  return [
    { title: "Avatar edit" },
  ];
}

export async function clientLoader({params}: Route.LoaderArgs) {
  try {
    const avatarId = params.id;
    const res = await fetchWithAuth(`avatars/${avatarId}`);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}


export default function AvatarEdit({ loaderData }: Route.ComponentProps) {
  const avatar: Avatar = loaderData;
  const fetcher = useFetcher();
  return (
    <fetcher.Form method='PATCH' action='/avatars/update' encType='multipart/form-data'>
      <input hidden name="avatarId" defaultValue={avatar.id} />

      <input id="name" name="name" defaultValue={avatar.name} />
      <input id="character" name="character" defaultValue={avatar.character} />
      <input hidden id="ttsVoiceId" name="ttsVoiceId" defaultValue={avatar.ttsVoiceId} />
      <input id="shortDesc" name="shortDesc" defaultValue={avatar.shortDesc} />
      <button type="submit">Update</button>
    </fetcher.Form>

  );
}
