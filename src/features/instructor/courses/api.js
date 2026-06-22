import client from "../../../api/client";

export async function fetchInstructorCourses(params) {
  const response = await client.get("/instructor/courses", { params });
  const payload = response?.data?.data;
  return {
    courses: payload || [],
    meta: response?.data?.meta || null,
  };
}

export async function fetchInstructorCourse(id) {
  const response = await client.get(`/instructor/courses/${id}`);
  return response?.data?.data || null;
}

export async function createInstructorCourse(body) {
  const response = await client.post("/instructor/courses", body);
  return response?.data?.data || null;
}

export async function updateInstructorCourse({ id, body }) {
  const response = await client.patch(`/instructor/courses/${id}`, body);
  return response?.data?.data || null;
}

export async function deleteInstructorCourse(id) {
  const response = await client.delete(`/instructor/courses/${id}`);
  return response?.data?.data || null;
}

export async function submitInstructorCourseForReview(id) {
  const response = await client.post(`/instructor/courses/${id}/submit-review`);
  return response?.data?.data || null;
}
