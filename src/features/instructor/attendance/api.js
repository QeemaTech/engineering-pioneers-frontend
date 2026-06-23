import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAttendanceSessions(params) {
  const response = await client.get(`${endpoints.instructor.attendance}/sessions`, { params });
  return {
    sessions: response?.data?.data || [],
    meta: response?.data?.meta || null,
  };
}

export async function fetchSessionAttendance(sessionId) {
  const response = await client.get(`${endpoints.instructor.attendance}/sessions/${sessionId}`);
  return response?.data?.data || null;
}

export async function markSessionAttendance(sessionId, studentId, present) {
  const response = await client.patch(
    `${endpoints.instructor.attendance}/sessions/${sessionId}/students/${studentId}`,
    { present }
  );
  return response?.data?.data || null;
}
