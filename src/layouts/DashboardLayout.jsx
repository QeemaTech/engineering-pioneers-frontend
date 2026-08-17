import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import QeemaCopyrightBadge from "../components/common/QeemaCopyrightBadge";

function DashboardLayout({ sidebarSections = [] }) {
  const { t } = useTranslation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const closeIfDesktop = () => {
      if (mq.matches) setIsMobileSidebarOpen(false);
    };
    closeIfDesktop();
    mq.addEventListener("change", closeIfDesktop);
    return () => mq.removeEventListener("change", closeIfDesktop);
  }, []);

  useEffect(() => {
    if (!isMobileSidebarOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setIsMobileSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-pioneer-light-bg font-sans text-pioneer-light-textPrimary transition-all duration-300 selection:bg-pioneer-orange/20 dark:bg-[#0F172A] dark:text-pioneer-dark-textPrimary dark:selection:bg-pioneer-orange/30 dark:selection:text-white">
      {/* Mobile drawer backdrop — below sidebar (z-[100]), above page */}
      {isMobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-[90] bg-black/50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <Sidebar
        sections={sidebarSections}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="relative flex min-w-0 min-h-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        {/* Dashboard Footer */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white/40 px-6 py-4 backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 sm:flex-row">
            <p className="text-center sm:text-start">{t("footer.copyright")}</p>
            <QeemaCopyrightBadge variant="auto" />
          </div>
        </footer>
      </div>
    </div>
  );
}



export default DashboardLayout;
