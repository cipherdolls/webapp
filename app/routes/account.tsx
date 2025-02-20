import type { Route } from "./+types/account";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Account" },
  ];
}

const backendUrl = 'http://localhost:4000';


export async function clientLoader() {
const token = localStorage.getItem('token');

  const res = await fetch(`${backendUrl}/users/me`, {
    headers: {
      Authorization: `Bearer ${token?.replaceAll('"', '')}`, 
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    // You could throw a Response or an Error here
    throw new Error(`Request failed with status ${res.status}`);
  }

  return await res.json();
}

export default function Account({ loaderData }: Route.ComponentProps) {
  console.log(loaderData)
  return (
    <div className="">
        Account
    </div>
  );
}
