import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import type { NavGroup as NavGroupType } from "../../../config/navigation";
import NavItem from "./NavItem";

function NavGroup({ group, isCollapsed = false }: { group: NavGroupType; isCollapsed?: boolean }) {
  const { t } = useTranslation();
  const location = useLocation();
  const isAnyChildActive = group.children.some((child) =>
    child.exact
      ? location.pathname === child.path
      : location.pathname === child.path || location.pathname.startsWith(`${child.path}/`)
  );

  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem(`pioneer-nav-${group.labelKey}`);
    if (saved !== null) return saved === "true";
    return isAnyChildActive;
  });

  useEffect(() => {
    localStorage.setItem(`pioneer-nav-${group.labelKey}`, String(open));
  }, [group.labelKey, open]);

  const Icon = group.icon;

  if (isCollapsed) {
    return (
      <NavLink
        to={group.basePath}
        title={t(group.labelKey)}
        className={`mx-1 flex items-center justify-center rounded-md px-2 py-2 transition-all duration-150 ${
          isAnyChildActive
            ? "border-s-2 border-pioneer-orange bg-pioneer-orange/10 text-pioneer-orange dark:bg-white/10 dark:text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        }`}
      >
        <Icon className="h-4 w-4" />
      </NavLink>
    );
  }

  return (
    <div className="mx-1">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-[13px] transition-all duration-150 ${
          isAnyChildActive
            ? "text-pioneer-orange dark:text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        }`}
      >
        <span className="flex items-center gap-2.5">
          <Icon className="h-4 w-4" />
          <span>{t(group.labelKey)}</span>
        </span>
        <ChevronRight
          className={`h-4 w-4 transition-transform duration-200 rtl:rotate-180 ${
            open ? "rotate-90" : "rotate-0"
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="pb-1">
          {group.children.map((child) => (
            <NavItem key={child.path} item={child} isSubItem />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NavGroup;

