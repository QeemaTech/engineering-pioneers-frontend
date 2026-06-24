import { useQuery } from "@tanstack/react-query";
import {
  fetchPublicInstructor,
  fetchPublicInstructorCourses,
  fetchPublicInstructorSlots,
  fetchPublicInstructors,
} from "./api";

export function usePublicInstructors(params: { search?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["public", "instructors", params],
    queryFn: () => fetchPublicInstructors(params),
    retry: false,
    staleTime: 60_000,
  });
}

export function usePublicInstructor(id: string | undefined) {
  return useQuery({
    queryKey: ["public", "instructor", id],
    queryFn: () => fetchPublicInstructor(id as string),
    enabled: !!id,
    retry: false,
  });
}

export function usePublicInstructorCourses(id: string | undefined) {
  return useQuery({
    queryKey: ["public", "instructor", id, "courses"],
    queryFn: () => fetchPublicInstructorCourses(id as string),
    enabled: !!id,
    retry: false,
  });
}

export function usePublicInstructorSlots(id: string | undefined) {
  return useQuery({
    queryKey: ["public", "instructor", id, "slots"],
    queryFn: () => fetchPublicInstructorSlots(id as string),
    enabled: !!id,
    retry: false,
  });
}
