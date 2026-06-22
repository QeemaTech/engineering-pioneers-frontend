import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchInstructorClassesForStudents(params) {
  const response = await client.get(endpoints.instructor.classes, { params });
  return response?.data?.data || [];
}

export async function fetchClassStudents(classId) {
  const url = classId
    ? `${endpoints.instructor.classes}/${classId}/students`
    : `${endpoints.instructor.classes}/students`;
  const response = await client.get(url);
  return response?.data?.data || [];
}

export async function fetchInstructorStudentPerformance(studentId) {
  const response = await client.get(`${endpoints.instructor.students}/${studentId}/performance`);
  return response?.data?.data || null;
}
