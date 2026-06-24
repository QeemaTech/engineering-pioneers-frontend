import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminStudentAttendance(studentId) {
  const response = await client.get(`${endpoints.admin.students}/${studentId}/attendance`);
  return response?.data?.data ?? { summary: {}, records: [] };
}
