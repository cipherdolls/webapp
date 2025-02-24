import { Form, redirect, useFetcher } from "react-router";
import type { Route } from "./+types/chats.$id.destroy";


export async function clientAction({ params }: Route.ClientActionArgs) {
  const chatId = params.id;
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const options = {
    method: 'delete',
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
  };
  try {
    const res = await fetch(`${backendUrl}/chats/${chatId}`, options);
    if (!res.ok) {
      console.error("Failed to delete chat:", res.status, res.statusText);
      return redirect("/error");
    }
    return redirect("/chats"); 
  } catch (error) {
    return redirect('/signin');
  }
}

export default function ChatDestroy() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method='post' action='destroy'>
      <button type='submit'>
         Delete Chat
      </button>
    </fetcher.Form>
  );
}
