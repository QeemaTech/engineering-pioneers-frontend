import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchLessonResources(lessonId: string) {
  const res = await client.get(endpoints.student.lessonResources(lessonId));
  const payload = res?.data?.data;
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray((payload as { resources?: unknown }).resources)) {
    return (payload as { resources: unknown[] }).resources;
  }
  return [];
}
