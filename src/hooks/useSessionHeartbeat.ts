import { useEffect } from "react";
import api from "../lib/api";
import endpoints from "../api/endpoints";
import useAuthStore from "../store/authStore";

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

export function useSessionHeartbeat(enabled = true) {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!enabled || !isAuthenticated || !refreshToken) return undefined;

    const ping = () => {
      api.post(endpoints.auth.heartbeat, { refreshToken }).catch(() => {
        // silent — interceptor handles auth failures
      });
    };

    ping();
    const id = window.setInterval(ping, HEARTBEAT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [enabled, isAuthenticated, refreshToken]);
}
