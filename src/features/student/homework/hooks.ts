import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHomeworkAssignment, fetchHomeworkByCourse, fetchMyHomework, submitHomework } from "./api";

export function useHomeworkList(courseId: string | undefined) {
  return useQuery({
    queryKey: ["student", "homework", "course", courseId],
    queryFn: () => fetchHomeworkByCourse(courseId as string),
    enabled: !!courseId,
    retry: false,
  });
}

export function useMyHomework() {
  return useQuery({
    queryKey: ["student", "homework", "mine"],
    queryFn: fetchMyHomework,
    retry: false,
  });
}

export function useHomeworkAssignment(homeworkId: string | undefined) {
  return useQuery({
    queryKey: ["student", "homework", "assignment", homeworkId],
    queryFn: () => fetchHomeworkAssignment(homeworkId as string),
    enabled: !!homeworkId,
    retry: false,
  });
}

export function useSubmitHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      homeworkId,
      courseId,
      body,
    }: {
      homeworkId: string;
      courseId?: string;
      body: { content?: string | null; fileUrl?: string | null } | FormData;
    }) => submitHomework(homeworkId, body),
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: ["student", "homework", "mine"] });
      void qc.invalidateQueries({ queryKey: ["student", "homework", "assignment", v.homeworkId] });
      if (v.courseId) void qc.invalidateQueries({ queryKey: ["student", "homework", "course", v.courseId] });
    },
  });
}
