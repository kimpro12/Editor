import { useQuery } from "@tanstack/react-query";
import { listDatasets } from "@/lib/api/client";

export function useDatasetsQuery() {
  return useQuery({
    queryKey: ["datasets"],
    queryFn: listDatasets,
  });
}
