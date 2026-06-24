import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function isCourseLearnPath(pathname) {
  return /^\/student\/courses\/[^/]+\/learn/.test(pathname);
}

function isDashboardPath(pathname) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/student")
  );
}

/**
 * Applies `dark` on <html> for dashboard shells (/admin, /instructor, /student)
 * using the user's stored preference. Public marketing routes stay in light mode.
 */
export default function ThemeHtmlSync() {
  const { pathname } = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    // Course player stays in light mode for readable lesson content.
    if (isCourseLearnPath(pathname)) {
      root.classList.remove("dark");
      return;
    }
    if (!isDashboardPath(pathname)) {
      root.classList.remove("dark");
      return;
    }
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [pathname, theme]);

  return null;
}
