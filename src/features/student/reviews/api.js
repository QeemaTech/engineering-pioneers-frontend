import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchCourseReviews(courseId, page = 1, limit = 20) {
  const res = await client.get(endpoints.public.courseReviews(courseId), {
    params: { page, limit },
  });
  return res?.data?.data ?? { reviews: [], pagination: { total: 0 } };
}

export async function fetchMyCourseReview(courseId) {
  const res = await client.get(endpoints.student.myCourseReview(courseId), {
    skip403Redirect: true,
  });
  return res?.data?.data ?? null;
}

export async function createCourseReview(courseId, body) {
  const res = await client.post(endpoints.student.createCourseReview(courseId), body, {
    skip403Redirect: true,
  });
  return res?.data?.data;
}

export async function updateCourseReview(reviewId, body) {
  const res = await client.patch(endpoints.student.updateCourseReview(reviewId), body, {
    skip403Redirect: true,
  });
  return res?.data?.data;
}

export function computeAverageRating(reviews) {
  if (!reviews?.length) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  return { average: sum / reviews.length, count: reviews.length };
}
