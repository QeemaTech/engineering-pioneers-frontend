import client from "../../api/client";
import endpoints from "../../api/endpoints";
import type {
  PublicCourseDetail,
  PublicCoursesListResult,
  PublicPostDetail,
  PublicPostsListResult,
  PublicPostListItem,
} from "./types";

export type PublicCoursesQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function fetchPublicCourses(params: PublicCoursesQuery = {}): Promise<PublicCoursesListResult> {
  const res = await client.get(endpoints.public.courses, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    },
  });
  const courses = (res?.data?.data as PublicCoursesListResult["courses"]) ?? [];
  const meta = (res?.data?.meta as PublicCoursesListResult["meta"]) ?? null;
  return { courses, meta };
}

export async function fetchPublicCourseById(id: string): Promise<PublicCourseDetail | null> {
  const res = await client.get(`${endpoints.public.courses}/${id}`);
  return (res?.data?.data as PublicCourseDetail) ?? null;
}

export type LandingPageSection = {
  key: string;
  content: unknown;
  isVisible?: boolean;
  order?: number;
};

export type PublicLandingPageData = {
  sections?: LandingPageSection[];
  featuredReviews?: unknown[];
  activePackages?: unknown[];
};

export async function fetchPublicLandingPage(): Promise<PublicLandingPageData> {
  const res = await client.get("/public/landing-page");
  const data = res?.data?.data;
  return data && typeof data === "object" ? (data as PublicLandingPageData) : {};
}

export async function fetchPublicPosts(params: PublicPostsQuery = {}): Promise<PublicPostsListResult> {
  const res = await client.get(endpoints.public.posts, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    },
  });
  const posts = (res?.data?.data as PublicPostListItem[]) ?? [];
  const meta = (res?.data?.meta as PublicPostsListResult["meta"]) ?? null;
  return { posts, meta };
}

export async function fetchPublicPostBySlug(slug: string): Promise<PublicPostDetail | null> {
  const res = await client.get(endpoints.public.post(slug));
  return (res?.data?.data as PublicPostDetail) ?? null;
}
