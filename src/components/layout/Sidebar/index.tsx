import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isNavGroup, type NavSection } from "../../../config/navigation";
import NavGroup from "./NavGroup";
import NavItem from "./NavItem";
import SectionLabel from "./SectionLabel";
import { t } from "i18next";

interface SidebarProps {
  sections: NavSection[];
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

function Sidebar({ sections, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { pathname } = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  const widthClass = isCollapsed ? "w-16" : "w-64";

  return (
    <aside
      className={`${widthClass} h-screen shrink-0 border-e border-slate-200 bg-pioneer-light-card transition-transform duration-300 ease-in-out dark:border-white/6 dark:bg-[#1E293B] max-lg:fixed max-lg:inset-y-0 max-lg:start-0 max-lg:z-[100] max-lg:shadow-2xl max-lg:max-w-[min(16rem,85vw)] lg:max-w-none lg:sticky lg:top-0 lg:z-30 lg:self-start lg:shadow-none lg:!translate-x-0 ${isMobileOpen
          ? "max-lg:translate-x-0"
          : "max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full"
        }`}
    >
      <div
        className={`flex h-16 items-center border-b border-slate-100 px-3 transition-all sm:h-20 sm:px-4 dark:border-white/6 ${isCollapsed ? "lg:justify-center" : "justify-between"
          }`}
      >
        <Link
          to="/"
          className={`flex items-center gap-3 overflow-hidden whitespace-nowrap transition hover:opacity-80 ${isCollapsed ? "lg:hidden" : ""}`}
          title={t("sidebarNav.items.websiteHome", { defaultValue: "Homepage" })}
        >
          <img
            src="/assets/ChatGPT%20Image%20Mar%2025,%202026,%2002_45_22%20PM%201.svg"
            alt="Engineering Pioneers"
            className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
          />
          <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Engineering Pioneers
          </h1>
        </Link>

        <div className="flex items-center gap-1">
          {/* Desktop Toggle */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:flex dark:hover:bg-white/5 dark:hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile Close */}
          <button
            onClick={() => setIsMobileOpen?.(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-4rem)] overflow-y-auto overscroll-y-contain py-4 no-scrollbar sm:h-[calc(100vh-5rem)]">
        {sections.map((section) => (
          <div key={section.labelKey} className="mb-3">
            {!isCollapsed ? <SectionLabel label={section.labelKey} /> : null}
            <nav className="space-y-1 px-2">
              {section.items.map((item) =>
                isNavGroup(item) ? (
                  <NavGroup key={item.labelKey} group={item} isCollapsed={isCollapsed} />
                ) : (
                  <NavItem key={item.path} item={item} isCollapsed={isCollapsed} />
                )
              )}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;