import { fetchWithAuth } from '~/utils/fetchWithAuth';

export async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    const errData = await response.json();
    const error = new Error(errData.message || 'Something went wrong') as Error & {
      code?: number;
    };
    error.code = response.status;
    throw error;
  }
  return response.json();
}
