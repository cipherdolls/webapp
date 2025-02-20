import { redirect } from "react-router";
import type { Route } from "./+types/avatarsIndex";
import type { Avatar } from "~/types";

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
  const headers = {
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
  };
  try {
    const res = await fetch(`${backendUrl}/avatars`, headers);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}



export default function AvatarsIndex({ loaderData }: Route.ComponentProps) {
  const avatars: Avatar[] = loaderData;
  return (
    <>
      <div className="">
            Avatars
      </div> 

      {avatars.map((avatar) => (
        <div key={avatar.id} className="flex items-center justify-between">
          <div>{avatar.name}</div>
        </div>
      ))}

    </>
  );
}
