import { redirect } from "react-router";
import type { Route } from "./+types/_main.account";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Account" },
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
    const res = await fetch(`${backendUrl}/users/me`, headers);
    return await res.json();
  } catch (error) {
    console.error(error);
    return redirect('/signin');
  }
}

export default function Account({ loaderData }: Route.ComponentProps) {
  console.log(loaderData)
  return (
    <div className="">
        Account
    </div>
  );
}
