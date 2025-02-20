import type { Route } from "./+types/avatarsIndex";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Avatars" },
  ];
}

export default function AvatarsIndex() {
  return (
    <div className="">
        Avatars
    </div>
  );
}
