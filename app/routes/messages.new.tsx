import { redirect } from "react-router";
import type { Route } from "./+types/messages.new";
import { fetchWithAuth } from "~/utils/fetchWithAuth";

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const res = await fetchWithAuth(`messages`, {
    method: request.method,
    body: formData,
  });
  return await res.json();
}
