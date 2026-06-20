import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminSection, deleteAdminSection, updateAdminSection } from "./api";

export function useCreateAdminSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "course"] }),
  });
}

export function useUpdateAdminSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "course"] }),
  });
}

export function useDeleteAdminSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "course"] }),
  });
}
