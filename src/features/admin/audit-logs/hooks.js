import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "./api";

export function useAuditLogs(params) {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: () => fetchAuditLogs(params),
    retry: false,
  });
}
