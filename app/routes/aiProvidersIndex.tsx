import type { Route } from "./+types/aiProvidersIndex";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AiProviders" },
  ];
}

const backendUrl = 'http://localhost:4000';


export async function loader() {
  const res = await fetch(`${backendUrl}/ai-providers`);
  return await res.json();
}

export default function AiProvidersIndex({ loaderData }: Route.ComponentProps) {
  console.log(loaderData)
  return (
    <div className="">
        AiProviders
    </div>
  );
}
