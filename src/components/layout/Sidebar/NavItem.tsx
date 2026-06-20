import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { NavItem as NavItemType } from "../../../config/navigation";

type Props = {
  item: NavItemType;
  isSubItem?: boolean;
  isCollapsed?: boolean;
};

function NavItem({ item, isSubItem = false, isCollapsed = false }: Props) {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = item.exact
    ? location.pathname === item.path
    : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

  if (isSubItem) {
    return (
      <NavLink
        to={item.path}
        className={`relative mx-1 flex items-center gap-2 rounded-md py-1.5 pe-3 ps-8 text-[13px] transition-all duration-150 ${
        isActive
          ? "border-s-2 border-pioneer-orange bg-pioneer-orange/10 ps-[30px] text-pioneer-orange dark:bg-pioneer-orange/20 dark:text-pioneer-orange"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-slate-300"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      <span>{t(item.labelKey)}</span>
    </NavLink>
  );
}

  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      title={isCollapsed ? t(item.labelKey) : undefined}
      className={`relative mx-1 flex items-center rounded-md py-2 text-[13px] transition-all duration-150 ${
        isCollapsed ? "justify-center px-2" : "gap-2.5 px-3"
      } ${
        isActive
          ? "border-s-2 border-pioneer-orange bg-pioneer-orange/10 ps-[10px] text-pioneer-orange dark:bg-white/10 dark:text-white"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      {!isCollapsed ? <span className="truncate">{t(item.labelKey)}</span> : null}
      {typeof item.badge === "number" && item.badge > 0 && !isCollapsed ? (
        <span className="ms-auto rounded-full bg-pioneer-orange px-1.5 py-0.5 text-[10px] font-bold text-white">
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  );
}

export default NavItem;

