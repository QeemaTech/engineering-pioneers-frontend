import { useQuery } from "@tanstack/react-query";
import { fetchAdminStudentAttendance } from "./attendanceApi";

export function useAdminStudentAttendance(studentId, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["admin", "student", studentId, "attendance"],
    queryFn: () => fetchAdminStudentAttendance(studentId),
    enabled: Boolean(studentId) && enabled,
  });
}
