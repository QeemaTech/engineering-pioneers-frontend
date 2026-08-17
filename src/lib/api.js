import axios from "axios";
import toast from "react-hot-toast";
import { navigateReplaceTo } from "./routerNavigation";
import useAuthStore from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

/* Attach access token to every request */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }
  return config;
});

/* Auto-refresh on 401 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 403) {
      const cfg = original || {};
      if (cfg.skip403Redirect) {
        return Promise.reject(error);
      }
      const code = error.response?.data?.code;
      if (code === "SUBSCRIPTION_QUOTA") {
        window.dispatchEvent(
          new CustomEvent("pioneer:subscription-quota", {
            detail: {
              message: error.response?.data?.message || "",
            },
          })
        );
        return Promise.reject(error);
      }
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      if (path.includes("/access-denied")) {
        return Promise.reject(error);
      }
      const msg =
        error.response?.data?.message ||
        "You don't have permission to access this resource.";
      toast.error(msg);
      queueMicrotask(() => navigateReplaceTo("/access-denied"));
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !original._retry) {
      const requestUrl = String(original?.url || "");
      const isAuthRequest =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/refresh") ||
        requestUrl.includes("/auth/logout");

      if (isAuthRequest) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (!window.location.pathname.includes("/login")) {
          navigateReplaceTo("/login");
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/auth/refresh`,
          { refreshToken }
        );
        const { accessToken, refreshToken: newRefresh } = data.data.tokens;
        useAuthStore.getState().setTokens({ accessToken, refreshToken: newRefresh });
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigateReplaceTo("/login");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
