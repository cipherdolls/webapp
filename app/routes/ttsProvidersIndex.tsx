import type { Route } from "./+types/ttsProvidersIndex";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TTS Providers" },
  ];
}

export default function TtsProvidersIndex() {
  return (
    <div className="">
        TtsProviders
    </div>
  );
}
