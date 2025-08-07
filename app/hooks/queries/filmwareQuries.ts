import { useQuery } from "@tanstack/react-query";
import type { Firmware } from "~/types";
import { fetchResource } from "./utils/fetchResource";


export function useFirmwares() {
  return useQuery({
    queryKey: ['firmwares'],
    queryFn: () => fetchResource<Firmware[]>('firmwares'),
  });
}