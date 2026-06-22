import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchInstructorExams(params) {
  const response = await client.get(endpoints.instructor.exams, { params });
  return {
    exams: response?.data?.data || [],
    meta: response?.data?.meta || null,
  };
}

export async function fetchInstructorExamDetail(examId) {
  const response = await client.get(`${endpoints.instructor.exams}/${examId}`);
  return response?.data?.data;
}

export async function fetchInstructorExamSubmissions(examId) {
  const response = await client.get(`${endpoints.instructor.exams}/${examId}/submissions`);
  return response?.data?.data || [];
}

export async function fetchInstructorCourseExamStructure(courseId) {
  const response = await client.get(`${endpoints.instructor.exams}/courses/${courseId}/structure`);
  return response?.data?.data;
}

export async function createInstructorExam(body) {
  const response = await client.post(endpoints.instructor.exams, body);
  return response?.data?.data;
}

export async function addInstructorExamQuestion(examId, body) {
  const response = await client.post(`${endpoints.instructor.exams}/${examId}/questions`, body);
  return response?.data?.data;
}

export async function updateInstructorExam({ examId, body }) {
  const response = await client.patch(`${endpoints.instructor.exams}/${examId}`, body);
  return response?.data?.data;
}

export async function deleteInstructorExam(examId) {
  const response = await client.delete(`${endpoints.instructor.exams}/${examId}`);
  return response?.data?.data;
}

export async function updateInstructorExamQuestion({ examId, questionId, body }) {
  const response = await client.patch(`${endpoints.instructor.exams}/${examId}/questions/${questionId}`, body);
  return response?.data?.data;
}

export async function deleteInstructorExamQuestion({ examId, questionId }) {
  const response = await client.delete(`${endpoints.instructor.exams}/${examId}/questions/${questionId}`);
  return response?.data?.data;
}
