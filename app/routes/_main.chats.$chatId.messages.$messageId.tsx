import { redirect } from "react-router";
import type { Message } from "~/types";
import type { Route } from "./+types/_main.chats.$chatId.messages.$messageId";
import { fetchWithAuth } from "~/utils/fetchWithAuth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chat Message" },
  ];
}

export async function clientLoader({params}: Route.LoaderArgs) {
  try {
    const { messageId } = params;
    const res = await fetchWithAuth(`messages/${messageId}`);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}


export default function ChatMessage({ loaderData }: Route.ComponentProps) {
  const message: Message = loaderData;
  return (
    <>
      <div className="">
        Chat Message Details
        {message.id}
      </div>
    </>
  );
}
