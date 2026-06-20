import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";
import endpoints from "../api/endpoints";
import { resolveUserPermissions } from "../hooks/usePermissions";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),

      setTokens: ({ accessToken, refreshToken }) => {
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        set({
          accessToken: accessToken ?? get().accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
        });
      },

      setUser: (user) => {
        if (user?.role) {
          const roleName =
            typeof user.role === "object" ? user.role.name : user.role;
          if (roleName) localStorage.setItem("role", String(roleName).toLowerCase());
        }
        const resolvedPermissions = resolveUserPermissions(user);
        const enriched = user
          ? { ...user, resolvedPermissions }
          : null;
        set({
          user: enriched,
          isAuthenticated: Boolean(enriched && get().accessToken),
        });
      },

      refreshProfile: async () => {
        const { data } = await api.get(endpoints.auth.me);
        const user = data?.data?.user || data?.data || null;
        if (user) get().setUser(user);
        return user;
      },

      /* ── Login ── */
      login: async ({ identifier, password, deviceFingerprint, deviceName, os, userAgent }) => {
        const { data } = await api.post(endpoints.auth.login, {
          identifier,
          password,
          deviceFingerprint,
          deviceName,
          os,
          userAgent,
        });
        const payload = data?.data || {};
        const user = payload.user
          ? {
              ...payload.user,
              role: payload.user.role || payload.role || null,
            }
          : null;
        const accessToken = payload?.tokens?.accessToken || payload?.token || null;
        const refreshToken = payload?.tokens?.refreshToken || payload?.refreshToken || null;
        get().setTokens({ accessToken, refreshToken });
        get().setUser(user);
        return user;
      },

      /* ── Register ── */
      register: async (payload) => {
        const { data } = await api.post(endpoints.auth.register, payload);
        const result = data?.data || {};
        const user = result.user
          ? {
              ...result.user,
              role: result.user.role || result.role || null,
            }
          : null;
        const accessToken = result?.tokens?.accessToken || result?.token || null;
        const refreshToken = result?.tokens?.refreshToken || result?.refreshToken || null;
        get().setTokens({ accessToken, refreshToken });
        get().setUser(user);
        return user;
      },

      /* ── Logout ── */
      logout: async () => {
        const refreshToken = get().refreshToken;
        try {
          await api.post(endpoints.auth.logout, { refreshToken });
        } catch {
          // always clear regardless of server response
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "pioneer-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.(true);
      },
      merge: (persistedState, currentState) => {
        const persisted =
          persistedState && typeof persistedState === "object" && "state" in persistedState
            ? persistedState.state || {}
            : persistedState || {};
        const persistedUser = persisted.user || currentState.user;
        const roleFromLegacy = persisted.role || localStorage.getItem("role");
        const mergedUser =
          persistedUser && roleFromLegacy
            ? { ...persistedUser, role: persistedUser.role || roleFromLegacy }
            : persistedUser;
        const accessToken =
          persisted.accessToken ||
          persisted.token ||
          localStorage.getItem("accessToken") ||
          null;
        const refreshToken =
          persisted.refreshToken || localStorage.getItem("refreshToken") || null;

        const enrichedUser = mergedUser
          ? { ...mergedUser, resolvedPermissions: resolveUserPermissions(mergedUser) }
          : null;

        return {
          ...currentState,
          ...persisted,
          user: enrichedUser,
          accessToken,
          refreshToken,
          hydrated: true,
          isAuthenticated:
            persisted.isAuthenticated ??
            Boolean(enrichedUser && accessToken),
        };
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        hydrated: state.hydrated,
      }),
    }
  )
);

export default useAuthStore;
