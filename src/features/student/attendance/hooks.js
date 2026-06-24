import { useQuery } from "@tanstack/react-query";
import { fetchMyAttendance } from "./api";

export function useMyAttendance(options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["student", "attendance"],
    queryFn: fetchMyAttendance,
    enabled,
  });
}
