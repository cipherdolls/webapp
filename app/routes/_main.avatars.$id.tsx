import { Form, Link, redirect } from "react-router";
import type { Avatar, Chat } from "~/types";
import ChatDestroy from "./chats.$id.destroy";
import type { Route } from "./+types/_main.avatars.$id";
import AvatarDestroy from "./avatars.$id.destroy";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chats" },
  ];
}

export async function clientLoader({params}: Route.LoaderArgs) {
  const avatarId = params.id;
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
    const res = await fetch(`${backendUrl}/avatars/${avatarId}`, headers);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}



export default function AvatarShow({ loaderData }: Route.ComponentProps) {
  const avatar: Avatar = loaderData;
  return (
    <>
      <div className="">
        {avatar.name}
        <Link to={`/avatars/${avatar.id}/edit`}>--------------Edit</Link>

        <AvatarDestroy />
      </div>
    </>


  );
}
