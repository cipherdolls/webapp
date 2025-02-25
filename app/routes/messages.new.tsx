import { redirect } from "react-router";
import type { Route } from "./+types/messages.new";

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
    body: formData,
  };
  try {
    const res = await fetch(`${backendUrl}/messages`, options);
    return await res.json();
  } catch (error: any) {
    console.error(error)
  }
}


