import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePublicSeoSettings } from "../features/admin/seo/hooks";

export function useSEO({
  title,
  description,
  keywords,
  image,
  type = "website",
  path,
  noIndex = false,
  schema = null,
} = {}) {
  const { i18n } = useTranslation();
  const { data: seoConfig } = usePublicSeoSettings();

  const currentLang = (i18n?.language || "ar").startsWith("ar") ? "ar" : "en";
  const global = seoConfig?.global || {};
  const pages = seoConfig?.pages || [];

  useEffect(() => {
    const currentPath = path || window.location.pathname;
    const pageConfig = pages.find((p) => p.path === currentPath || p.path === currentPath.replace(/\/$/, ""));

    let resolvedTitle = title;
    if (!resolvedTitle && pageConfig) {
      resolvedTitle = currentLang === "ar" ? pageConfig.titleAr : pageConfig.titleEn || pageConfig.titleAr;
    }
    if (!resolvedTitle) {
      resolvedTitle = global.siteTitle || "رواد الهندسة | Engineering Pioneers";
    } else if (global.titleTemplate && resolvedTitle !== global.siteTitle && !resolvedTitle.includes("|")) {
      resolvedTitle = global.titleTemplate.replace("%s", resolvedTitle);
    }
    document.title = resolvedTitle;
  }, [title, path, currentLang, global, pages]);
}

export default useSEO;
