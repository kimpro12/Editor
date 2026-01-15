import { useQuery } from "@tanstack/react-query";
import { health } from "@/lib/api/client";

export function useHealthQuery() {
  return useQuery({
    queryKey: ["health"],
    queryFn: health,
    enabled: false,
  });
}
