import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCompletedLessonIds,
  fetchCourseProgressStats,
  fetchCourseResume,
  postLessonAccess,
  postLessonComplete,
} from "./api";

export function useCourseProgressStats(courseId: string | undefined) {
  return useQuery({
    queryKey: ["student", "progress-stats", courseId],
    queryFn: () => fetchCourseProgressStats(courseId as string),
    enabled: !!courseId,
    retry: false,
  });
}

export function useCourseResume(courseId: string | undefined) {
  return useQuery({
    queryKey: ["student", "progress-resume", courseId],
    queryFn: () => fetchCourseResume(courseId as string),
    enabled: !!courseId,
    retry: false,
  });
}

export function useCompletedLessonIds(courseId: string | undefined) {
  return useQuery({
    queryKey: ["student", "completed-lessons", courseId],
    queryFn: () => fetchCompletedLessonIds(courseId as string),
    enabled: !!courseId,
    retry: false,
  });
}

export function useTrackLessonAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      lessonId,
      courseId,
      watchPercentage,
    }: {
      lessonId: string;
      courseId: string;
      watchPercentage?: number;
    }) => postLessonAccess(lessonId, courseId, watchPercentage),
    retry: false,
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: ["student", "progress-stats", v.courseId] });
    },
  });
}

export function useMarkLessonComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, courseId }: { lessonId: string; courseId: string }) =>
      postLessonComplete(lessonId, courseId),
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: ["student", "progress-stats", v.courseId] });
      void qc.invalidateQueries({ queryKey: ["student", "completed-lessons", v.courseId] });
      void qc.invalidateQueries({ queryKey: ["student", "progress-resume", v.courseId] });
      void qc.invalidateQueries({ queryKey: ["student", "my-courses"] });
      void qc.invalidateQueries({ queryKey: ["student", "progress"] });
    },
  });
}

/** @deprecated Use useCourseProgressStats */
export const useCohortProgressStats = useCourseProgressStats;
/** @deprecated Use useCourseResume */
export const useCohortResume = useCourseResume;
