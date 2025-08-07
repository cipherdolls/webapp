import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "~/utils/fetchWithAuth";
import type { Firmware } from "~/types";

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}


export function useFirmwares() {
  return useQuery({
    queryKey: ['firmwares'],
    queryFn: () => fetchResource<Firmware[]>('firmwares'),
  });
}