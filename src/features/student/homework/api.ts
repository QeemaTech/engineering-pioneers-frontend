import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchHomeworkByCourse(courseId: string) {
  const res = await client.get(endpoints.homework.courseList(courseId));
  return res?.data?.data ?? [];
}

/** @deprecated Use fetchHomeworkByCourse */
export async function fetchHomeworkByCohort(cohortId: string) {
  return fetchHomeworkByCourse(cohortId);
}

export async function fetchMyHomework() {
  const res = await client.get(endpoints.homework.mine);
  return res?.data?.data ?? [];
}

export async function fetchHomeworkAssignment(homeworkId: string) {
  const res = await client.get(endpoints.homework.assignment(homeworkId));
  return res?.data?.data ?? null;
}

export async function submitHomework(
  homeworkId: string,
  body: { content?: string | null; fileUrl?: string | null } | FormData
) {
  const url = endpoints.homework.submit(homeworkId);
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const res = await client.post(url, body, {
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData && headers && typeof headers === "object") {
            delete (headers as Record<string, unknown>)["Content-Type"];
          }
          return data;
        },
      ],
    });
    return res?.data?.data ?? null;
  }
  const res = await client.post(url, body);
  return res?.data?.data ?? null;
}
