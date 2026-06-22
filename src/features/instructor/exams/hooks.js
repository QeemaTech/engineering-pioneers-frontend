import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addInstructorExamQuestion,
  createInstructorExam,
  fetchInstructorCourseExamStructure,
  fetchInstructorExamDetail,
  fetchInstructorExamSubmissions,
  fetchInstructorExams,
  updateInstructorExam,
  deleteInstructorExam,
  updateInstructorExamQuestion,
  deleteInstructorExamQuestion,
} from "./api";

export function useInstructorExams(params) {
  return useQuery({
    queryKey: ["instructor", "exams", params],
    queryFn: () => fetchInstructorExams(params),
  });
}

export function useInstructorExamDetail(examId) {
  return useQuery({
    queryKey: ["instructor", "exams", examId, "detail"],
    queryFn: () => fetchInstructorExamDetail(examId),
    enabled: Boolean(examId),
  });
}

export function useInstructorExamSubmissions(examId) {
  return useQuery({
    queryKey: ["instructor", "exams", examId, "submissions"],
    queryFn: () => fetchInstructorExamSubmissions(examId),
    enabled: Boolean(examId),
  });
}

export function useInstructorCourseExamStructure(courseId) {
  return useQuery({
    queryKey: ["instructor", "exams", "structure", courseId],
    queryFn: () => fetchInstructorCourseExamStructure(courseId),
    enabled: Boolean(courseId),
  });
}

export function useCreateInstructorExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInstructorExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "exams"] });
    },
  });
}

export function useAddInstructorExamQuestion(examId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => addInstructorExamQuestion(examId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "exams", examId] });
      queryClient.invalidateQueries({ queryKey: ["instructor", "exams", examId, "detail"] });
    },
  });
}

export function useUpdateInstructorExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInstructorExam,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "exams"] });
      queryClient.invalidateQueries({ queryKey: ["instructor", "exams", vars.examId, "detail"] });
    },
  });
}

export function useDeleteInstructorExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInstructorExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "exams"] });
    },
  });
}

export function useUpdateInstructorExamQuestion(examId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => updateInstructorExamQuestion({ examId, ...body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "exams", examId, "detail"] });
    },
  });
}

export function useDeleteInstructorExamQuestion(examId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => deleteInstructorExamQuestion({ examId, ...body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "exams", examId, "detail"] });
    },
  });
}
