import { Form, redirect, useFetcher } from "react-router";
import { fetchWithAuth } from "~/utils/fetchWithAuth";
import type { Route } from "./+types/embedding-models.$id.destroy";

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const res = await fetchWithAuth(`embedding-models/${params.id}`, {
    method: request.method,
  });
  return await res.json();
}


export default function EmbeddingModelDestroy() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="DELETE" action='destroy'>
      <button type='submit'>
         Delete Embedding Model
      </button>
    </fetcher.Form>
  );
}
