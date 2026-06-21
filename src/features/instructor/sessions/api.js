import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchCourseSessions(courseId) {
  const response = await client.get(`${endpoints.instructor.courses}/${courseId}/sessions`);
  return response?.data?.data || [];
}

export async function createCourseSession(courseId, payload) {
  const response = await client.post(`${endpoints.instructor.courses}/${courseId}/sessions`, payload);
  return response?.data?.data;
}

export async function updateCourseSession(courseId, sessionId, payload) {
  const response = await client.patch(
    `${endpoints.instructor.courses}/${courseId}/sessions/${sessionId}`,
    payload
  );
  return response?.data?.data;
}

export async function deleteCourseSession(courseId, sessionId) {
  const response = await client.delete(
    `${endpoints.instructor.courses}/${courseId}/sessions/${sessionId}`
  );
  return response?.data?.data;
}
