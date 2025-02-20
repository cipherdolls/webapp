import type { Route } from "./+types/avatarsDetails";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function AvatarDetails() {
  return (
    <div className="">
        AvatarDetails
    </div>
  );
}
