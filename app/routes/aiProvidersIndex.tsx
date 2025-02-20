import type { Route } from "./+types/aiProvidersIndex";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AiProviders" },
  ];
}

export default function AiProvidersIndex() {
  return (
    <div className="">
        AiProviders
    </div>
  );
}
