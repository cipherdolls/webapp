import type { Route } from "./+types/chats.$idd.edit";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chat edit" },
  ];
}




export default function ChatEdit() {
  return (
    <>
      <div className="">
        edit
      </div>
    </>
  );
}
