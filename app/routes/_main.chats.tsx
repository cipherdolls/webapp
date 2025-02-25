import { Link, Outlet, redirect } from "react-router";
import type { Chat } from "~/types";
import type { Route } from "./+types/_main.chats";

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
    if (!res.ok) {
      console.error("Failed to get chats", res.status, res.statusText);
      return redirect("/signin");
    }
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const body = Object.fromEntries(formData);
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const options = {
    method: 'post',
    headers: {  
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
  try {
    const res = await fetch(`${backendUrl}/chats`, options);
    
    if (!res.ok) {
      console.error("Failed to create chat:", res.status, res.statusText);
      return redirect("/error");
    }
    return redirect("/chats");
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
          <Link to={`/chats/${chat.id}`}>{chat.id}</Link>
        </div>
      ))}

      <Outlet />

    </>


  );
}
