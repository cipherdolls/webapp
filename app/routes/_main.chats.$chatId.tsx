import { Form, Link, Outlet, redirect } from "react-router";
import type { Chat, Message } from "~/types";
import ChatDestroy from "./chats.$id.destroy";
import type { Route } from "./+types/_main.chats.$chatId";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chats" },
  ];
}

export async function clientLoader({params}: Route.LoaderArgs) {
  const chatId = params.chatId;
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
    const [chatRes, messagesRes] = await Promise.all([
      fetch(`${backendUrl}/chats/${chatId}`, headers),
      fetch(`${backendUrl}/messages?chatId=${chatId}`, headers),
    ]);
    if (!chatRes.ok || !messagesRes.ok) {
      throw new Error("Failed to fetch data");
    }
    const chat: Chat = await chatRes.json();
    const messages: Message[] = await messagesRes.json();

    return { chat, messages };
  } catch (error) {
    return redirect('/signin');
  }
}



export default function ChatShow({ loaderData }: Route.ComponentProps) {
  const { chat, messages } = loaderData;

  return (
    <>
      <div className="">
        {chat.id}
        <Link to={`/chats/${chat.id}/edit`}>--------------Edit Chat</Link>

        <div className="">
          {messages.map((message) => (
            <div key={message.id}>
              <Link to={`/chats/${chat.id}/messages/${message.id}`}>{message.content}</Link>
            </div>
          ))}
        </div>

        <ChatDestroy />
        <Outlet />
      </div>
    </>


  );
}
