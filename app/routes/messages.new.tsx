import { redirect } from "react-router";
import type { Route } from "./+types/messages.new";
import { fetchWithAuth } from "~/utils/fetchWithAuth";

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const res = await fetchWithAuth(`messages`, {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      return await res.json();
    }
    return await res.json();
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
