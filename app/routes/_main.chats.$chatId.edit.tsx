import type { Route } from "./+types/_main.chats.$chatId.edit";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chat edit" },
  ];
}




export default function ChatEdit() {
  return (
    <>
      <div className="">
      ChatEdit
      </div>
    </>
  );
}
