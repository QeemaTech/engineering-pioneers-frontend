import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchInstructorCourses,
  fetchInstructorCourse,
  createInstructorCourse,
  updateInstructorCourse,
  deleteInstructorCourse,
  submitInstructorCourseForReview,
} from "./api";

export function useInstructorCourses(params) {
  return useQuery({
    queryKey: ["instructor", "courses", params],
    queryFn: () => fetchInstructorCourses(params),
    retry: false,
  });
}

export function useInstructorCourse(id) {
  return useQuery({
    queryKey: ["instructor", "course", id],
    queryFn: () => fetchInstructorCourse(id),
    enabled: !!id,
    retry: false,
  });
}

export function useCreateInstructorCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInstructorCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
    },
  });
}

export function useUpdateInstructorCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInstructorCourse,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["instructor", "course", vars.id] });
    },
  });
}

export function useDeleteInstructorCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInstructorCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
    },
  });
}

export function useSubmitInstructorCourseForReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitInstructorCourseForReview,
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["instructor", "course", courseId] });
    },
  });
}
