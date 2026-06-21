import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchCourseProgressStats(courseId: string) {
  const res = await client.get(endpoints.student.progressStats(courseId));
  return res?.data?.data ?? null;
}

export async function fetchCourseResume(courseId: string) {
  const res = await client.get(endpoints.student.progressResume(courseId));
  return res?.data?.data ?? null;
}

export async function fetchCompletedLessonIds(courseId: string) {
  const res = await client.get(endpoints.student.progressCompletedLessons(courseId));
  return res?.data?.data?.lessonIds ?? [];
}

export async function postLessonAccess(lessonId: string, courseId: string, watchPercentage = 0) {
  const res = await client.post(endpoints.student.progressLessonAccess(lessonId), { courseId, watchPercentage });
  return res?.data?.data ?? null;
}

export async function postLessonComplete(lessonId: string, courseId: string) {
  const res = await client.post(endpoints.student.progressLessonComplete(lessonId), { courseId });
  return res?.data?.data ?? null;
}
