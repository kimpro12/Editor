import { useQuery } from "@tanstack/react-query";
import { getDataset } from "@/lib/api/client";

export function useDatasetQuery(id: string) {
  return useQuery({
    queryKey: ["dataset", id],
    queryFn: () => getDataset(id),
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      return status === "FINALIZING" ? 800 : false;
    },
  });
}
