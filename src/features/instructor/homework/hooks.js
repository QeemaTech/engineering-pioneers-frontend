import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchInstructorHomeworkQueue,
  gradeHomeworkSubmission,
  patchHomeworkSubmissionReviewStatus,
  createInstructorHomework,
  deleteInstructorHomework,
} from "./api";

export function useInstructorHomeworkQueue() {
  return useQuery({
    queryKey: ["instructor", "homework", "queue"],
    queryFn: fetchInstructorHomeworkQueue,
  });
}

export function usePatchHomeworkReviewStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, instructorReviewStatus }) =>
      patchHomeworkSubmissionReviewStatus(submissionId, instructorReviewStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "homework"] });
    },
  });
}

export function useGradeHomeworkSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, grade, feedback }) =>
      gradeHomeworkSubmission(submissionId, { grade, feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "homework"] });
    },
  });
}

export function useCreateInstructorHomework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInstructorHomework,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "homework"] });
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["instructor", "course"] });
    },
  });
}

export function useDeleteInstructorHomework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInstructorHomework,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "homework"] });
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["instructor", "course"] });
    },
  });
}
