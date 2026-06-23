export function pickLocalized(value, lang) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const isAr = String(lang).toLowerCase().startsWith("ar");
    const primary = isAr ? value.ar : value.en;
    const fallback = isAr ? value.en : value.ar;
    if (typeof primary === "string" && primary.trim()) return primary;
    if (typeof fallback === "string") return fallback;
  }
  return "";
}

export function splitLocalized(value) {
  if (typeof value === "string") return { en: value, ar: "" };
  if (value && typeof value === "object") {
    return {
      en: typeof value.en === "string" ? value.en : "",
      ar: typeof value.ar === "string" ? value.ar : "",
    };
  }
  return { en: "", ar: "" };
}

export function joinLocalized(en, ar) {
  return { en: en || "", ar: ar || "" };
}

export function localizedPostFields(post, lang) {
  if (!post) return { title: "", content: null };
  const isAr = String(lang).toLowerCase().startsWith("ar");
  const title = isAr && post.titleAr ? post.titleAr : post.title || "";
  const content = isAr && post.contentAr ? post.contentAr : post.content;
  return { title, content };
}

export function parseCmsSections(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item;
      const heading = typeof o.heading === "string" ? o.heading : "";
      const body = typeof o.body === "string" ? o.body : "";
      const id = typeof o.id === "string" ? o.id : heading.slice(0, 24) || crypto.randomUUID?.() || String(Math.random());
      const listItems = Array.isArray(o.listItems)
        ? o.listItems.filter((x) => typeof x === "string" && x.trim())
        : [];
      if (!heading && !body && listItems.length === 0) return null;
      return { id, heading, body, listItems };
    })
    .filter(Boolean);
}
