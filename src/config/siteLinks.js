/**
 * Fallbacks when the API is unavailable (env or defaults).
 * Live values come from GET /public/settings via useSiteSettings().
 */
export const SITE_SETTINGS_FALLBACK = {
  siteName: "Engineering Pioneers",
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || "hello@engineeringpioneers.com",
  phoneNumber: import.meta.env.VITE_SUPPORT_PHONE || "",
  social: {
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK_URL || "",
    twitter: import.meta.env.VITE_SOCIAL_X_URL || "",
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM_URL || "",
    linkedin: import.meta.env.VITE_SOCIAL_LINKEDIN_URL || "",
  },
};

/** @deprecated Use useSiteSettings().settings.social */
export const SOCIAL_URLS = SITE_SETTINGS_FALLBACK.social;

/** @deprecated Use useSiteSettings().settings.contactEmail */
export const CONTACT_EMAIL = SITE_SETTINGS_FALLBACK.contactEmail;
