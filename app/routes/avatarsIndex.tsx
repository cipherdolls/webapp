import type { Route } from "./+types/avatarsIndex";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function AvatarsIndex() {
  return (
    <div className="">
        AvatarsIndex
    </div>
  );
}
