import { useMutation } from "@tanstack/react-query";
import { presignUpload } from "@/lib/api/client";

export function usePresignUploadMutation() {
  return useMutation({ mutationFn: presignUpload });
}
