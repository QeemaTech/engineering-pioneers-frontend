export function getBackendOrigin() {
  const api = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  return api.replace(/\/api\/v1\/?$/, "");
}

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
}

export function getStaticCertificateUrl(pdfPath) {
  if (!pdfPath) return null;
  return `${getBackendOrigin()}${pdfPath}`;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function openCertificateDownloadUrl(path) {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const href = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  window.open(href, "_blank", "noopener,noreferrer");
}
