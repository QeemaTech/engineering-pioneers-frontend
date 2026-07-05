import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchLessonQuestions(lessonId) {
  const res = await client.get(endpoints.student.lessonQuestions(lessonId));
  return res?.data?.data ?? [];
}

export async function createLessonQuestion(lessonId, body) {
  const res = await client.post(endpoints.student.lessonQuestions(lessonId), body);
  return res?.data?.data ?? null;
}

export async function createQuestionAnswer(questionId, body) {
  const res = await client.post(endpoints.student.questionAnswers(questionId), body);
  return res?.data?.data ?? null;
}

export async function fetchMyQuestions() {
  const res = await client.get(endpoints.student.myQuestions);
  return res?.data?.data ?? [];
}
