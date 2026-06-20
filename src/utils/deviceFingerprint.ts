/** Stable-ish device fingerprint for session binding (matches backend UserDevice). */
export async function getDeviceFingerprint(): Promise<string> {
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(parts);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  let h = 0;
  for (let i = 0; i < parts.length; i++) {
    h = (Math.imul(31, h) + parts.charCodeAt(i)) | 0;
  }
  return `fp-${Math.abs(h)}`;
}

export function getDeviceMetadata() {
  const ua = navigator.userAgent;
  let os = "Unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return {
    deviceName: navigator.platform || "Browser",
    os,
    userAgent: ua,
  };
}
