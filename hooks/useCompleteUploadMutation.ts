import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeUpload } from "@/lib/api/client";

export function useCompleteUploadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeUpload,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["dataset", vars.dataset_id] });
      qc.invalidateQueries({ queryKey: ["datasets"] });
    },
  });
}
