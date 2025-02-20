import type { Route } from "./+types/sttProvidersIndex";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "STT Providers" },
  ];
}

export default function SttProvidersIndex() {
  return (
    <div className="">
        SttProviders
    </div>
  );
}
