import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInstructor,
  deleteInstructor,
  fetchAdminInstructorAvailability,
  fetchAdminInstructorById,
  fetchAdminInstructorPerformance,
  fetchAdminInstructors,
  updateInstructor,
} from "./api";

export function useAdminInstructors(params) {
  return useQuery({
    queryKey: ["admin", "instructors", params],
    queryFn: () => fetchAdminInstructors(params),
  });
}

export function useCreateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInstructor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "instructors"] }),
  });
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInstructor,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "instructors"] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["admin", "instructors", variables.id] });
      }
    },
  });
}

export function useDeleteInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInstructor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "instructors"] }),
  });
}

export function useAdminInstructorById(id) {
  return useQuery({
    queryKey: ["admin", "instructors", id],
    queryFn: () => fetchAdminInstructorById(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useAdminInstructorPerformance(instructorId, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["admin", "instructors", instructorId, "performance"],
    queryFn: () => fetchAdminInstructorPerformance(instructorId),
    enabled: Boolean(instructorId) && enabled,
    retry: false,
  });
}

export function useAdminInstructorAvailability(instructorId, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["admin", "instructors", instructorId, "availability"],
    queryFn: () => fetchAdminInstructorAvailability(instructorId),
    enabled: Boolean(instructorId) && enabled,
    retry: false,
  });
}
