import { redirect } from "react-router";
import type { Route } from "./+types/chatsIndex";
import type { Chat } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chats" },
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
    const res = await fetch(`${backendUrl}/chats`, headers);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}



export default function ChatsIndex({ loaderData }: Route.ComponentProps) {
  const chats: Chat[] = loaderData;
  return (
    <>
      <div className="">
        Chats
      </div>

      {chats.map((chat) => (
        <div key={chat.id} className="flex items-center justify-between">
          <div>{chat.id}</div>
        </div>
      ))}

    </>


  );
}
