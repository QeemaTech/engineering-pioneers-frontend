import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCourseSession,
  deleteCourseSession,
  fetchCourseSessions,
  updateCourseSession,
} from "./api";

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor", "sessions", courseId] }),
  });
}

export function useUpdateCourseSession(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, ...payload }) => updateCourseSession(courseId, sessionId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor", "sessions", courseId] }),
  });
}

export function useDeleteCourseSession(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => deleteCourseSession(courseId, sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor", "sessions", courseId] }),
  });
}
