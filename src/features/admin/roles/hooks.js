import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminRole,
  deleteAdminRole,
  fetchAdminPermissions,
  fetchAdminRole,
  fetchAdminRoles,
  updateAdminRole,
} from "./api";

export function useAdminRoles() {
  return useQuery({
    queryKey: ["admin", "roles"],
    queryFn: fetchAdminRoles,
    retry: false,
  });
}

export function useAdminRole(id) {
  return useQuery({
    queryKey: ["admin", "roles", id],
    queryFn: () => fetchAdminRole(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useAdminPermissions() {
  return useQuery({
    queryKey: ["admin", "permissions"],
    queryFn: fetchAdminPermissions,
    retry: false,
  });
}

export function useCreateAdminRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "roles"] }),
  });
}

export function useUpdateAdminRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "roles"] }),
  });
}

export function useDeleteAdminRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "roles"] }),
  });
}
