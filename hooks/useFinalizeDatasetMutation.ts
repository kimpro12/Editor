import { useMutation, useQueryClient } from "@tanstack/react-query";
import { finalizeDataset } from "@/lib/api/client";

export function useFinalizeDatasetMutation(datasetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof finalizeDataset>[1]) => finalizeDataset(datasetId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dataset", datasetId] });
      qc.invalidateQueries({ queryKey: ["datasets"] });
    },
  });
}
