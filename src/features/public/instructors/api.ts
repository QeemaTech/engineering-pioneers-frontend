import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export type PublicInstructor = {
  id: string;
  fullName: string;
  avatar?: string | null;
  bio?: string | null;
  experience?: number | null;
  averageRating?: number | null;
};

export type PublicInstructorDetail = PublicInstructor & {
  receivedReviews?: Array<{
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    student?: { fullName?: string; avatar?: string | null };
  }>;
};

export type PublicInstructorCourse = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  type?: string;
  price?: number | null;
};

export type PublicInstructorSlot = {
  id: string;
  startTime: string;
  endTime: string;
  price?: number | null;
};

export async function fetchPublicInstructors(params: { page?: number; limit?: number; search?: string } = {}) {
  const res = await client.get(endpoints.public.instructors, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 24,
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    },
  });
  return {
    instructors: (res?.data?.data ?? []) as PublicInstructor[],
    pagination: res?.data?.meta ?? {},
  };
}

export async function fetchPublicInstructor(id: string) {
  const res = await client.get(endpoints.public.instructor(id));
  return (res?.data?.data ?? null) as PublicInstructorDetail | null;
}

export async function fetchPublicInstructorCourses(id: string) {
  const res = await client.get(endpoints.public.instructorCourses(id));
  return (res?.data?.data ?? []) as PublicInstructorCourse[];
}

export async function fetchPublicInstructorSlots(id: string, limit = 24) {
  const res = await client.get(endpoints.public.instructorSlots(id), { params: { limit } });
  return (res?.data?.data ?? []) as PublicInstructorSlot[];
}
