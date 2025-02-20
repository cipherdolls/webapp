import type { Route } from "./+types/chatsIndex";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chats" },
  ];
}

export default function ChatsIndex() {
  return (
    <div className="">
        Chats
    </div>
  );
}
