import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDataset } from "@/lib/api/client";

export function useCreateDatasetMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDataset,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["datasets"] }),
  });
}
