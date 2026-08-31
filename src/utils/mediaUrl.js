const DEFAULT_API = "http://localhost:3000/api/v1";

export function getBackendOrigin() {
  const api = import.meta.env.VITE_API_URL || DEFAULT_API;
  return String(api).replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
}

export function resolveMediaUrl(value) {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.includes("images.unsplash.com")) {
    let url = trimmed;
    if (!url.includes("auto=format")) {
      url += (url.includes("?") ? "&" : "?") + "auto=format&fit=crop&q=75";
    }
    return url;
  }

  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;

  let path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (path.startsWith("/api/v1/uploads/")) {
    path = path.replace("/api/v1", "");
  }
  return `${getBackendOrigin()}${path}`;
}
