import { Link, redirect } from "react-router";
import type { Chat } from "~/types";
import type { Route } from "./+types/_main.chats.$id";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chats" },
  ];
}

export async function clientLoader({params}: Route.LoaderArgs) {
  const chatId = params.id;
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
    const res = await fetch(`${backendUrl}/chats/${chatId}`, headers);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}



export default function ChatShow({ loaderData }: Route.ComponentProps) {
  const chat: Chat = loaderData;
  return (
    <>
      <div className="">
        {chat.id}
        <Link to={`/chats/${chat.id}/edit`}>--------------Edit</Link>
      </div>
    </>


  );
}
