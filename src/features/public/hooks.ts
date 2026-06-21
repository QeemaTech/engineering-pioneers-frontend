import { useQuery } from "@tanstack/react-query";
import {
  fetchPublicCourseById,
  fetchPublicCourses,
  fetchPublicLandingPage,
  fetchPublicPostBySlug,
  fetchPublicPosts,
  type PublicCoursesQuery,
  type PublicPostsQuery,
} from "./api";

export function usePublicCourses(params: PublicCoursesQuery) {
  return useQuery({
    queryKey: ["public", "courses", params],
    queryFn: () => fetchPublicCourses(params),
    retry: false,
  });
}

export function usePublicCourse(id: string | undefined) {
  return useQuery({
    queryKey: ["public", "course", id],
    queryFn: () => fetchPublicCourseById(id as string),
    enabled: !!id,
    retry: false,
  });
}

export function usePublicLandingPage() {
  return useQuery({
    queryKey: ["public", "landing-page"],
    queryFn: () => fetchPublicLandingPage(),
    retry: false,
  });
}

export function usePublicPosts(params: PublicPostsQuery) {
  return useQuery({
    queryKey: ["public", "posts", params],
    queryFn: () => fetchPublicPosts(params),
    retry: false,
  });
}

export function usePublicPost(slug: string | undefined) {
  return useQuery({
    queryKey: ["public", "post", slug],
    queryFn: () => fetchPublicPostBySlug(slug as string),
    enabled: !!slug,
    retry: false,
  });
}
