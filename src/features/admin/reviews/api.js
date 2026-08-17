import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminCourseReviews(params = {}) {
  const response = await client.get(endpoints.admin.reviews, { params });
  const payload = response?.data?.data;
  return {
    reviews: payload?.reviews || [],
    total: payload?.total || 0,
    page: payload?.page || 1,
    limit: payload?.limit || 20,
  };
}

export async function setAdminReviewVisibility(reviewId, isVisible) {
  const response = await client.patch(endpoints.admin.reviewVisibility(reviewId), { isVisible });
  return response?.data?.data;
}

export async function setAdminReviewFeatured(reviewId, isFeatured) {
  const response = await client.patch(endpoints.admin.reviewFeature(reviewId), { isFeatured });
  return response?.data?.data;
}

export async function deleteAdminReview(reviewId) {
  const response = await client.delete(endpoints.admin.reviewDelete(reviewId));
  return response?.data;
}
