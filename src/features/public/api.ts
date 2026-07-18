import client from "../../api/client";
import endpoints from "../../api/endpoints";
import type {
  PublicCourseDetail,
  PublicCoursesListResult,
  PublicPostDetail,
  PublicPostsListResult,
  PublicPostListItem,
  RecommendedCoursesResult,
} from "./types";

export type PublicCoursesQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  type?: string;
  level?: string;
  price?: string;
};

export async function fetchRecommendedCourses(params: { filter?: string; limit?: number } = {}): Promise<RecommendedCoursesResult> {
  const res = await client.get(`${endpoints.public.courses}/recommended`, {
    params: {
      filter: params.filter ?? "bestseller",
      limit: params.limit ?? 8,
    },
  });
  const data = res?.data?.data;
  return {
    tabs: Array.isArray(data?.tabs) ? data.tabs : [],
    courses: Array.isArray(data?.courses) ? data.courses : [],
    filter: data?.filter ?? params.filter ?? "bestseller",
  };
}

export async function fetchPublicCourses(params: PublicCoursesQuery = {}): Promise<PublicCoursesListResult> {
  const res = await client.get(endpoints.public.courses, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(params.level ? { level: params.level } : {}),
      ...(params.price ? { price: params.price } : {}),
    },
  });
  const courses = (res?.data?.data as PublicCoursesListResult["courses"]) ?? [];
  const meta = (res?.data?.meta as PublicCoursesListResult["meta"]) ?? null;
  return { courses, meta };
}

export async function fetchPublicCategories(): Promise<any[]> {
  const res = await client.get("/categories");
  return res?.data?.data || res?.data || [];
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

export type PublicCmsPage = {
  slug: string;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string;
  subtitleAr?: string;
  sectionsEn?: unknown;
  sectionsAr?: unknown;
  isPublished?: boolean;
  updatedAt?: string;
};

export async function fetchPublicCmsPage(slug: string): Promise<PublicCmsPage | null> {
  const res = await client.get(`/public/pages/${encodeURIComponent(slug)}`);
  return (res?.data?.data as PublicCmsPage) ?? null;
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

export async function fetchPublicPackages(): Promise<any[]> {
  const res = await client.get(endpoints.public.packages);
  return res?.data?.data || [];
}

export async function fetchPublicPackageById(id: string): Promise<any | null> {
  const res = await client.get(`${endpoints.public.packages}/${id}`);
  return res?.data?.data || null;
}
