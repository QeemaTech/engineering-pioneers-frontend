import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instructorOverviewQueryKey } from "../../instructor/overview/hooks";
import {
  assignAdminCourseInstructor,
  approveCourse,
  createAdminCourse,
  createAdminLesson,
  createAdminUnit,
  deleteAdminCourse,
  deleteAdminLesson,
  deleteAdminUnit,
  addCourseStaff,
  fetchAdminCourse,
  fetchAdminCourses,
  fetchAdminUnits,
  fetchCourseStaff,
  fetchReviewQueue,
  removeCourseStaff,
  rejectCourse,
  submitCourseForReview,
  updateAdminCourse,
  updateAdminLesson,
  updateAdminUnit,
  fetchCourseSessions,
  createCourseSession,
  updateCourseSession,
  deleteCourseSession,
} from "./api";

export function useAdminCourses(params) {
  return useQuery({
    queryKey: ["admin", "courses", params],
    queryFn: () => fetchAdminCourses(params),
    retry: false,
  });
}

export function useAdminCourse(id) {
  return useQuery({
    queryKey: ["admin", "course", id],
    queryFn: () => fetchAdminCourse(id),
    enabled: !!id,
    retry: false,
  });
}

export function useAdminUnits(params) {
  return useQuery({
    queryKey: ["admin", "units", params],
    queryFn: () => fetchAdminUnits(params),
    retry: false,
  });
}

export function useCreateAdminCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });
}

export function useUpdateAdminCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminCourse,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "course", vars.id] });
    },
  });
}

export function useDeleteAdminCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });
}

export function useCreateAdminUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminUnit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "course"] }),
  });
}

export function useUpdateAdminUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminUnit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "course"] }),
  });
}

export function useDeleteAdminUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminUnit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "course"] }),
  });
}

export function useCreateAdminLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course"] });
      queryClient.invalidateQueries({ queryKey: instructorOverviewQueryKey });
      queryClient.invalidateQueries({ queryKey: ["instructor", "course"] });
    },
  });
}

export function useUpdateAdminLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course"] });
      queryClient.invalidateQueries({ queryKey: instructorOverviewQueryKey });
      queryClient.invalidateQueries({ queryKey: ["instructor", "course"] });
    },
  });
}

export function useDeleteAdminLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course"] });
      queryClient.invalidateQueries({ queryKey: instructorOverviewQueryKey });
      queryClient.invalidateQueries({ queryKey: ["instructor", "course"] });
    },
  });
}

export function useAssignAdminCourseInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignAdminCourseInstructor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });
}

export function useReviewQueue(params) {
  return useQuery({
    queryKey: ["admin", "courses", "review-queue", params],
    queryFn: () => fetchReviewQueue(params),
    retry: false,
  });
}

export function useSubmitCourseForReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitCourseForReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", "review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "course"] });
    },
  });
}

export function useApproveCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", "review-queue"] });
    },
  });
}

export function useRejectCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", "review-queue"] });
    },
  });
}

export function useCourseStaff(courseId) {
  return useQuery({
    queryKey: ["admin", "course", courseId, "staff"],
    queryFn: () => fetchCourseStaff(courseId),
    enabled: Boolean(courseId),
    retry: false,
  });
}

export function useAddCourseStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCourseStaff,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", vars?.courseId, "staff"] });
    },
  });
}

export function useRemoveCourseStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeCourseStaff,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", vars?.courseId, "staff"] });
    },
  });
}

export function useCourseSessions(courseId) {
  return useQuery({
    queryKey: ["admin", "course", courseId, "sessions"],
    queryFn: () => fetchCourseSessions(courseId),
    enabled: !!courseId,
    retry: false,
  });
}

export function useCreateCourseSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, body }) => createCourseSession(courseId, body),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", vars.courseId, "sessions"] });
    },
  });
}

export function useUpdateCourseSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, sessionId, body }) => updateCourseSession(courseId, sessionId, body),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", vars.courseId, "sessions"] });
    },
  });
}

export function useDeleteCourseSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, sessionId }) => deleteCourseSession(courseId, sessionId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", vars.courseId, "sessions"] });
    },
  });
}
