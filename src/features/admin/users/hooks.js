import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStudentByAdmin,
  fetchAdminStudentPerformance,
  fetchAdminUserById,
  fetchAdminUsers,
  forceLogoutUser,
  fetchUserDevices,
  fetchUserSessions,
  grantUserPermission,
  revokeUserPermission,
  setAdminUserPassword,
  toggleAdminUserActive,
  updateAdminUser,
} from "./api";

export function useAdminUsers(params) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => fetchAdminUsers(params),
    retry: false,
  });
}

export function useToggleAdminUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleAdminUserActive,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      const id = data?.id;
      if (id) void queryClient.invalidateQueries({ queryKey: ["admin", "users", id] });
    },
  });
}

export function useAdminUserById(id) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => fetchAdminUserById(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useAdminStudentPerformance(studentId, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["admin", "students", studentId, "performance"],
    queryFn: () => fetchAdminStudentPerformance(studentId),
    enabled: Boolean(studentId) && enabled,
    retry: false,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminUser,
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      if (vars?.id) void queryClient.invalidateQueries({ queryKey: ["admin", "users", vars.id] });
    },
  });
}

export function useCreateStudentByAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStudentByAdmin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useSetAdminUserPassword() {
  return useMutation({
    mutationFn: setAdminUserPassword,
  });
}

export function useUserSessions(userId) {
  return useQuery({
    queryKey: ["admin", "users", userId, "sessions"],
    queryFn: () => fetchUserSessions(userId),
    enabled: Boolean(userId),
    retry: false,
  });
}

export function useUserDevices(userId) {
  return useQuery({
    queryKey: ["admin", "users", userId, "devices"],
    queryFn: () => fetchUserDevices(userId),
    enabled: Boolean(userId),
    retry: false,
  });
}

export function useGrantUserPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: grantUserPermission,
    onSuccess: (_, vars) => {
      if (vars?.userId) void queryClient.invalidateQueries({ queryKey: ["admin", "users", vars.userId] });
    },
  });
}

export function useRevokeUserPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeUserPermission,
    onSuccess: (_, vars) => {
      if (vars?.userId) void queryClient.invalidateQueries({ queryKey: ["admin", "users", vars.userId] });
    },
  });
}

export function useForceLogoutUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: forceLogoutUser,
    onSuccess: (_, userId) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users", userId, "sessions"] });
    },
  });
}
