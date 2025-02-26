import { Form, Link, redirect } from "react-router";
import type { Avatar } from "~/types";
import type { Route } from "./+types/_main.avatars._index";

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
    const res = await fetch(`${backendUrl}/avatars?published=true`, headers);
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
          <Link to={`/avatars/${avatar.id}`}>{avatar.name}</Link>
          
          <Form method='post' action="/chats">
            <input hidden name='avatarId' id='avatarId' value={avatar.id} readOnly />
            <button type='submit' >
                Chat
            </button>
          </Form>

        </div>
      ))}

    </>
  );
}
