import { useQuery } from "@tanstack/react-query";
import { fetchAdminStats, fetchAdminOverview } from "./api";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchAdminStats,
    retry: false,
  });
}

export function useAdminOverview(range = "30d") {
  return useQuery({
    queryKey: ["admin", "overview", range],
    queryFn: () => fetchAdminOverview(range),
    retry: false,
  });
}

