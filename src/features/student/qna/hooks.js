import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLessonQuestion, createQuestionAnswer, fetchLessonQuestions, fetchMyQuestions } from "./api";

export function useLessonQuestions(lessonId) {
  return useQuery({
    queryKey: ["student", "qna", lessonId],
    queryFn: () => fetchLessonQuestions(lessonId),
    enabled: Boolean(lessonId),
    retry: false,
  });
}

export function useMyQuestions() {
  return useQuery({
    queryKey: ["student", "qna", "my-questions"],
    queryFn: fetchMyQuestions,
    retry: false,
  });
}

export function useCreateLessonQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, body }) => createLessonQuestion(lessonId, body),
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: ["student", "qna", v.lessonId] });
      void qc.invalidateQueries({ queryKey: ["student", "qna", "my-questions"] });
    },
  });
}

export function useCreateQuestionAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, lessonId, body }) => createQuestionAnswer(questionId, body),
    onSuccess: (_, v) => {
      if (v.lessonId) void qc.invalidateQueries({ queryKey: ["student", "qna", v.lessonId] });
      void qc.invalidateQueries({ queryKey: ["student", "qna", "my-questions"] });
    },
  });
}
