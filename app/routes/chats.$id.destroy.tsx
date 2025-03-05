import { Form, redirect, useFetcher } from "react-router";
import type { Route } from "./+types/chats.$id.destroy";
import { fetchWithAuth } from "~/utils/fetchWithAuth";

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  try {
    const chatId = params.id;
    const res = await fetchWithAuth(`chats/${chatId}`, {
      method: request.method,
    });

    if (!res.ok) {
      return await res.json();
    }
    
    return redirect(`/`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}


export default function ChatDestroy() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="DELETE" action='destroy'>
      <button type='submit'>
         Delete Chat
      </button>
    </fetcher.Form>
  );
}
