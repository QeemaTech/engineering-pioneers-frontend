import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFaqItem,
  createBanner,
  createPost,
  createSection,
  deleteBanner,
  deleteFaqItem,
  deletePost,
  fetchBanners,
  fetchFaqs,
  fetchPosts,
  fetchSections,
  updateAboutUs,
  updateHero,
  updateBanner,
  updateFaqItem,
  updatePost,
  updateSection,
} from "./api";

export function useAdminFaqs() {
  return useQuery({
    queryKey: ["admin", "cms", "faq"],
    queryFn: fetchFaqs,
  });
}

export function useAdminSections() {
  return useQuery({
    queryKey: ["admin", "cms", "sections"],
    queryFn: fetchSections,
  });
}

function invalidateCms(queryClient) {
  queryClient.invalidateQueries({ queryKey: ["admin", "cms", "faq"] });
  queryClient.invalidateQueries({ queryKey: ["admin", "cms", "sections"] });
  queryClient.invalidateQueries({ queryKey: ["admin", "cms", "posts"] });
  queryClient.invalidateQueries({ queryKey: ["admin", "cms", "banners"] });
  queryClient.invalidateQueries({ queryKey: ["public", "landing-page"] });
}

export function useAddFaqItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addFaqItem,
    onSuccess: () => invalidateCms(queryClient),
  });
}

export function useUpdateFaqItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFaqItem,
    onSuccess: () => invalidateCms(queryClient),
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSection,
    onSuccess: () => invalidateCms(queryClient),
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSection,
    onSuccess: () => invalidateCms(queryClient),
  });
}

export function useUpdateAboutUs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAboutUs,
    onSuccess: () => invalidateCms(queryClient),
  });
}

export function useUpdateHero() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateHero,
    onSuccess: () => invalidateCms(queryClient),
  });
}

export function useAdminPosts(params) {
  return useQuery({
    queryKey: ["admin", "cms", "posts", params],
    queryFn: () => fetchPosts(params),
    retry: false,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => invalidateCms(queryClient),
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updatePost(id, body),
    onSuccess: () => invalidateCms(queryClient),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => invalidateCms(queryClient),
  });
}

export function useAdminBanners() {
  return useQuery({
    queryKey: ["admin", "cms", "banners"],
    queryFn: fetchBanners,
    retry: false,
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBanner,
    onSuccess: () => invalidateCms(queryClient),
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateBanner(id, body),
    onSuccess: () => invalidateCms(queryClient),
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => invalidateCms(queryClient),
  });
}

export function useDeleteFaqItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFaqItem,
    onSuccess: () => invalidateCms(queryClient),
  });
}
