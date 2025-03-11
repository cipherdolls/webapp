import { redirect } from "react-router";
import { fetchWithAuth } from "~/utils/fetchWithAuth";
import type { Route } from "./+types/chat-models.new";


export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const jsonData: Record<string, any> = {};
  formData.forEach((value, key) => {
    jsonData[key] = value;
  });
  const res = await fetchWithAuth(`chat-models`, {
    method: request.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData),
  });
  return await res.json();
}