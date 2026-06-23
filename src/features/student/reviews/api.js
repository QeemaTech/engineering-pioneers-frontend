import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchCourseReviews(courseId, page = 1, limit = 20) {
  const res = await client.get(endpoints.student.courseReviews(courseId), {
    params: { page, limit },
  });
  return res?.data?.data ?? { reviews: [], pagination: { total: 0 } };
}

export function computeAverageRating(reviews) {
  if (!reviews?.length) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  return { average: sum / reviews.length, count: reviews.length };
}
