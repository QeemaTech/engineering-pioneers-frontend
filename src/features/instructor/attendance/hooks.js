import { useQuery } from "@tanstack/react-query";
import { fetchAttendanceSessions, fetchSessionAttendance } from "./api";

export function useAttendanceSessions(params, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["instructor", "attendance", "sessions", params],
    queryFn: () => fetchAttendanceSessions(params),
    enabled,
  });
}

export function useSessionAttendance(sessionId, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["instructor", "attendance", "session", sessionId],
    queryFn: () => fetchSessionAttendance(sessionId),
    enabled: Boolean(sessionId) && enabled,
  });
}
