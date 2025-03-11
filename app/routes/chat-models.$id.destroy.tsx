import { Form, redirect, useFetcher } from "react-router";
import { fetchWithAuth } from "~/utils/fetchWithAuth";
import type { Route } from "./+types/chat-models.$id.destroy";

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const res = await fetchWithAuth(`chat-models/${params.id}`, {
    method: request.method,
  });
  return await res.json();
}


export default function ChatModelDestroy() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="DELETE" action='destroy'>
      <button type='submit'>
         Delete Chat Model
      </button>
    </fetcher.Form>
  );
}
