import { redirect } from "react-router";
import type { Message } from "~/types";
import type { Route } from "./+types/_main.chats.$chatId.messages.$messageId";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chat Message" },
  ];
}

export async function clientLoader({params}: Route.LoaderArgs) {
  const { id, messageId } = params;
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
    const res = await fetch(`${backendUrl}/messages/${messageId}`, headers);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}



export default function ChatMessage({ loaderData }: Route.ComponentProps) {
  const message: Message = loaderData;
  return (
    <>
      <div className="">
        Chat Message Details
        {message.id}
      </div>
    </>
  );
}
