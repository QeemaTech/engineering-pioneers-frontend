import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePublicSeoSettings } from "../../features/admin/seo/hooks";

function setMetaTag(attrName, attrValue, content) {
  if (!content) return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonicalTag(url) {
  if (!url) return;
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", url);
}

function setStructuredData(schema) {
  let element = document.getElementById("seo-structured-data");
  if (!schema) {
    if (element) element.remove();
    return;
  }
  if (!element) {
    element = document.createElement("script");
    element.id = "seo-structured-data";
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(schema);
}

/**
 * Injects Google Analytics 4 script tag if tracking ID exists.
 */
function injectGA4(gaId) {
  if (!gaId || document.getElementById("ga4-script")) return;
  const scriptTag = document.createElement("script");
  scriptTag.id = "ga4-script";
  scriptTag.async = true;
  scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(scriptTag);

  const initScript = document.createElement("script");
  initScript.id = "ga4-init";
  initScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}');
  `;
  document.head.appendChild(initScript);
}

export default function SEOHead({
  title,
  description,
  keywords,
  image,
  type = "website",
  path,
  noIndex = false,
  schema = null,
}) {
  const { i18n } = useTranslation();
  const { data: seoConfig } = usePublicSeoSettings();

  const currentLang = (i18n?.language || "ar").startsWith("ar") ? "ar" : "en";
  const global = seoConfig?.global || {};
  const pages = seoConfig?.pages || [];

  useEffect(() => {
    // Determine path
    const currentPath = path || window.location.pathname;
    const pageConfig = pages.find((p) => p.path === currentPath || p.path === currentPath.replace(/\/$/, ""));

    // 1. Resolve Title
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

    // 2. Resolve Description
    let resolvedDesc = description;
    if (!resolvedDesc && pageConfig) {
      resolvedDesc = currentLang === "ar" ? pageConfig.descriptionAr : pageConfig.descriptionEn || pageConfig.descriptionAr;
    }
    if (!resolvedDesc) {
      resolvedDesc = global.metaDescription || "منصة رواد الهندسة - المنصة التعليمية الرائدة للطلاب والمهندسين في العالم العربي.";
    }
    setMetaTag("name", "description", resolvedDesc);

    // 3. Resolve Keywords
    let resolvedKeywords = keywords;
    if (!resolvedKeywords && pageConfig) {
      resolvedKeywords = pageConfig.keywords;
    }
    if (!resolvedKeywords) {
      resolvedKeywords = global.metaKeywords || "هندسة, كورسات هندسية, رواد الهندسة, engineering pioneers";
    }
    setMetaTag("name", "keywords", resolvedKeywords);

    // 4. Resolve Canonical URL
    const baseUrl = (global.canonicalBaseUrl || window.location.origin).replace(/\/+$/, "");
    const fullUrl = `${baseUrl}${currentPath}`;
    setCanonicalTag(fullUrl);

    // 5. Resolve Image
    let resolvedImage = image;
    if (!resolvedImage && pageConfig?.ogImage) {
      resolvedImage = pageConfig.ogImage;
    }
    if (!resolvedImage) {
      resolvedImage = global.ogImage || "/assets/logo.png";
    }
    if (resolvedImage && !resolvedImage.startsWith("http")) {
      resolvedImage = `${baseUrl}${resolvedImage.startsWith("/") ? "" : "/"}${resolvedImage}`;
    }

    // 6. OpenGraph tags
    setMetaTag("property", "og:title", resolvedTitle);
    setMetaTag("property", "og:description", resolvedDesc);
    setMetaTag("property", "og:image", resolvedImage);
    setMetaTag("property", "og:url", fullUrl);
    setMetaTag("property", "og:type", type);
    setMetaTag("property", "og:site_name", global.siteTitle || "Engineering Pioneers");
    setMetaTag("property", "og:locale", currentLang === "ar" ? "ar_AR" : "en_US");

    // 7. Twitter Card tags
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", resolvedTitle);
    setMetaTag("name", "twitter:description", resolvedDesc);
    setMetaTag("name", "twitter:image", resolvedImage);
    if (global.twitterHandle) {
      setMetaTag("name", "twitter:site", global.twitterHandle);
    }

    // 8. Robots Directives
    const shouldNoIndex = global.allowIndexing === false || noIndex === true || pageConfig?.noIndex === true;
    setMetaTag("name", "robots", shouldNoIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    // 9. Verification tags
    if (global.googleSiteVerification) {
      setMetaTag("name", "google-site-verification", global.googleSiteVerification);
    }
    if (global.bingSiteVerification) {
      setMetaTag("name", "msvalidate.01", global.bingSiteVerification);
    }

    // 10. GA4
    if (global.googleAnalyticsId) {
      injectGA4(global.googleAnalyticsId);
    }

    // 11. Schema.org Structured Data
    setStructuredData(schema);
  }, [
    title,
    description,
    keywords,
    image,
    type,
    path,
    noIndex,
    schema,
    currentLang,
    global,
    pages,
  ]);

  return null;
}
