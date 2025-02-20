import type { Route } from "./+types/avatarsDetails";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Avatar" },
  ];
}

export default function AvatarDetails() {
  return (
    <div className="">
        AvatarDetails
    </div>
  );
}
