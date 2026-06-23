import { useQuery } from "@tanstack/react-query";
import { fetchInstructorOverview } from "./api";

export function useInstructorOverview() {
  return useQuery({
    queryKey: ["instructor", "overview"],
    queryFn: fetchInstructorOverview,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export const instructorOverviewQueryKey = ["instructor", "overview"];
