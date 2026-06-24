import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchMyAttendance() {
  const response = await client.get(endpoints.student.attendance);
  return response?.data?.data ?? { summary: {}, records: [] };
}
