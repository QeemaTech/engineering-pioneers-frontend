import { io } from "socket.io-client";

let socket = null;

export function getSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  const api = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  return api.replace(/\/api\/v1\/?$/, "");
}

export function getAttendanceSocket() {
  if (socket?.connected) return socket;

  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  if (!socket) {
    socket = io(getSocketUrl(), {
      path: "/socket.io",
      auth: { token },
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  } else if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }

  return socket;
}

export function disconnectAttendanceSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
