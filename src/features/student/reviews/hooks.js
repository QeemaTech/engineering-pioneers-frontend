import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCourseReview,
  fetchCourseReviews,
  fetchMyCourseReview,
  updateCourseReview,
} from "./api";

export function useCourseReviews(courseId, { page = 1, limit = 50 } = {}) {
  return useQuery({
    queryKey: ["public", "course-reviews", courseId, page, limit],
    queryFn: () => fetchCourseReviews(courseId, page, limit),
    enabled: Boolean(courseId),
    retry: false,
  });
}

export function useMyCourseReview(courseId, enabled = false) {
  return useQuery({
    queryKey: ["student", "course-review-mine", courseId],
    queryFn: () => fetchMyCourseReview(courseId),
    enabled: Boolean(courseId) && enabled,
    retry: false,
  });
}

export function useUpsertCourseReview(courseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, rating, comment }) => {
      const body = { rating, comment: comment?.trim() || "" };
      if (reviewId) return updateCourseReview(reviewId, body);
      return createCourseReview(courseId, body);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["public", "course-reviews", courseId] });
      void qc.invalidateQueries({ queryKey: ["student", "course-review-mine", courseId] });
      void qc.invalidateQueries({ queryKey: ["public", "landing-page"] });
    },
  });
}
