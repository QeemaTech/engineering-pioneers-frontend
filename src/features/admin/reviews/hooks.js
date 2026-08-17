import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminReview,
  fetchAdminCourseReviews,
  setAdminReviewFeatured,
  setAdminReviewVisibility,
} from "./api";

const KEY = ["admin", "course-reviews"];

export function useAdminCourseReviews(params = {}) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => fetchAdminCourseReviews(params),
    retry: false,
  });
}

export function useSetAdminReviewVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, isVisible }) => setAdminReviewVisibility(reviewId, isVisible),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEY });
      void qc.invalidateQueries({ queryKey: ["public", "course-reviews"] });
      void qc.invalidateQueries({ queryKey: ["public", "landing-page"] });
    },
  });
}

export function useSetAdminReviewFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, isFeatured }) => setAdminReviewFeatured(reviewId, isFeatured),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEY });
      void qc.invalidateQueries({ queryKey: ["public", "landing-page"] });
    },
  });
}

export function useDeleteAdminReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEY });
      void qc.invalidateQueries({ queryKey: ["public", "course-reviews"] });
      void qc.invalidateQueries({ queryKey: ["public", "landing-page"] });
    },
  });
}
