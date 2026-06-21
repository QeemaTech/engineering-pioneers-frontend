import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchInstructorQuestions(params) {
  const response = await client.get(`${endpoints.instructor.qna}/questions`, { params });
  return response?.data?.data || [];
}

export async function replyToQuestion({ questionId, body }) {
  const response = await client.post(`${endpoints.instructor.qna}/questions/${questionId}/answers`, { body });
  return response?.data?.data;
}

export async function toggleResolveQuestion(questionId) {
  const response = await client.patch(`${endpoints.instructor.qna}/questions/${questionId}/resolve`);
  return response?.data?.data;
}
