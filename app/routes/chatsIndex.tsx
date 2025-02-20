import type { Route } from "./+types/chatsIndex";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function ChatsIndex() {
  return (
    <div className="">
        ChatsIndex
    </div>
  );
}
