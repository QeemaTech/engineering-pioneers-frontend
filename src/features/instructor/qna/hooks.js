import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchInstructorQuestions, replyToQuestion, toggleResolveQuestion } from "./api";

export function useInstructorQuestions(params) {
  return useQuery({
    queryKey: ["instructor", "qna", "questions", params],
    queryFn: () => fetchInstructorQuestions(params),
  });
}

export function useQuestionsByLesson(lessonId) {
  return useInstructorQuestions({ lessonId });
}

export function useReplyToQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: replyToQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor", "qna", "questions"] }),
  });
}

export function useToggleResolveQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleResolveQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor", "qna", "questions"] }),
  });
}
