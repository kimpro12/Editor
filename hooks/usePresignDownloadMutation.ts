import { useMutation } from "@tanstack/react-query";
import { presignDownload } from "@/lib/api/client";

export function usePresignDownloadMutation() {
  return useMutation({ mutationFn: presignDownload });
}
