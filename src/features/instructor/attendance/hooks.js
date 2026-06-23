import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAttendanceSessions, fetchSessionAttendance, markSessionAttendance } from "./api";

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

export function useMarkSessionAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, studentId, present }) =>
      markSessionAttendance(sessionId, studentId, present),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["instructor", "attendance", "session", variables.sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["instructor", "attendance", "sessions"] });
    },
  });
}
