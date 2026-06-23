import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCourseSession,
  deleteCourseSession,
  fetchCourseSessions,
  updateCourseSession,
} from "./api";
import { instructorOverviewQueryKey } from "../overview/hooks";

function invalidateSessionCaches(queryClient, courseId) {
  queryClient.invalidateQueries({ queryKey: ["instructor", "sessions", courseId] });
  queryClient.invalidateQueries({ queryKey: instructorOverviewQueryKey });
}

export function useCourseSessions(courseId) {
  return useQuery({
    queryKey: ["instructor", "sessions", courseId],
    queryFn: () => fetchCourseSessions(courseId),
    enabled: Boolean(courseId),
  });
}

export function useCreateCourseSession(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createCourseSession(courseId, payload),
    onSuccess: () => invalidateSessionCaches(queryClient, courseId),
  });
}

export function useUpdateCourseSession(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, ...payload }) => updateCourseSession(courseId, sessionId, payload),
    onSuccess: () => invalidateSessionCaches(queryClient, courseId),
  });
}

export function useDeleteCourseSession(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => deleteCourseSession(courseId, sessionId),
    onSuccess: () => invalidateSessionCaches(queryClient, courseId),
  });
}
