import { useQuery } from "@tanstack/react-query";
import type { Firmware, Paginated } from "~/types";
import { fetchResource } from "./utils/fetchResource";


export function useFirmwares() {
  return useQuery({
    queryKey: ['firmwares'],
    queryFn: async () => {
      const response = await fetchResource<Paginated<Firmware>>('firmwares');
      return response.data;
    },
  });
}