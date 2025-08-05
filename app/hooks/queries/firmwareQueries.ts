import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Firmware } from '~/types';

// Generic fetch function
async function fetchResource<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

// Firmware queries
export function useFirmware(firmwareId: string) {
  return useQuery({
    queryKey: ['firmware', firmwareId],
    queryFn: () => fetchResource<Firmware>(`firmwares/${firmwareId}`),
    enabled: !!firmwareId,
  });
}

export function useFirmwares(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['firmwares', page, limit],
    queryFn: () => fetchResource<any>(`firmwares?page=${page}&limit=${limit}`),
  });
}

export function useLatestFirmware() {
  return useQuery({
    queryKey: ['firmware', 'latest'],
    queryFn: () => fetchResource<Firmware>('firmwares/latest'),
  });
}