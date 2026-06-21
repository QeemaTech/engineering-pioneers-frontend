import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAdminEnrollment, fetchAdminEnrollments } from "./api";

export function useAdminEnrollments(params) {
  return useQuery({
    queryKey: ["admin", "enrollments", params],
    queryFn: () => fetchAdminEnrollments(params),
    retry: false,
  });
}

export function useCreateAdminEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "enrollments"] });
    },
  });
}

