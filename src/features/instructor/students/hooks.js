import { useQuery } from "@tanstack/react-query";
import {
  fetchClassStudents,
  fetchInstructorClassesForStudents,
  fetchInstructorStudentPerformance,
} from "./api";

export function useInstructorClassesForStudents(params) {
  return useQuery({
    queryKey: ["instructor", "students", "classes", params],
    queryFn: () => fetchInstructorClassesForStudents(params),
  });
}

export function useClassStudents(classId) {
  return useQuery({
    queryKey: ["instructor", "students", "list", classId || "all"],
    queryFn: () => fetchClassStudents(classId),
  });
}

export function useInstructorStudentPerformance(studentId, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["instructor", "students", studentId, "performance"],
    queryFn: () => fetchInstructorStudentPerformance(studentId),
    enabled: Boolean(studentId) && enabled,
    retry: false,
  });
}
