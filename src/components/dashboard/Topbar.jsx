import { User, Settings, LogOut, Shield, ChevronDown, Sun, Moon, Menu, LayoutDashboard, Globe, Home, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useTheme } from "../../contexts/ThemeContext";
import { useLang } from "../../contexts/LangContext";
import NotificationBell from "./NotificationBell";
import { resolveMediaUrl } from "../../utils/mediaUrl";

function Topbar({ onMenuClick }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isAdminShell = pathname.startsWith("/admin");
  const isStudentShell = pathname.startsWith("/student");
  const isInstructorShell = pathname.startsWith("/instructor");

  const roleLabel = useMemo(() => {
    const role = typeof user?.role === "object" ? user.role.name : user?.role;
    if (isStudentShell) return t("header.dashboardMenu.studentPanel", { defaultValue: "Student" });
    if (isInstructorShell) return t("header.dashboardMenu.instructorPanel", { defaultValue: "Instructor" });
    if (isAdminShell) return role || t("header.admin", { defaultValue: "Admin" });
    return role || "";
  }, [user?.role, isStudentShell, isInstructorShell, isAdminShell, t]);

  const profileMenuItems = useMemo(() => {
    const close = () => setIsProfileOpen(false);
    if (isStudentShell) {
      return [
        {
          icon: Home,
          labelKey: "header.dashboardMenu.websiteHome",
          onClick: () => {
            close();
            navigate("/");
          },
        },
        {
          icon: Globe,
          labelKey: "header.dashboardMenu.websiteExplore",
          onClick: () => {
            close();
            navigate("/explore");
          },
        },
        {
          icon: GraduationCap,
          labelKey: "header.dashboardMenu.websiteInstructors",
          onClick: () => {
            close();
            navigate("/instructors");
          },
        },
        {
          icon: User,
          labelKey: "header.dashboardMenu.account",
          onClick: () => {
            close();
            navigate("/student/settings");
          },
        },
        {
          icon: LayoutDashboard,
          labelKey: "header.dashboardMenu.studentHome",
          onClick: () => {
            close();
            navigate("/student");
          },
        },
      ];
    }
    if (isAdminShell) {
      return [
        {
          icon: User,
          labelKey: "header.dashboardMenu.account",
          onClick: () => {
            close();
            navigate("/admin/account");
          },
        },
        {
          icon: Settings,
          labelKey: "header.dashboardMenu.platformSettings",
          onClick: () => {
            close();
            navigate("/admin/settings");
          },
        },
      ];
    }
    return [
      {
        icon: User,
        labelKey: "header.dashboardMenu.account",
        onClick: () => {
          close();
          navigate("/instructor/settings");
        },
      },
      {
        icon: LayoutDashboard,
        labelKey: "header.dashboardMenu.instructorHome",
        onClick: () => {
          close();
          navigate("/instructor");
        },
      },
    ];
  }, [isAdminShell, isStudentShell, navigate]);

  const currentLng = lang;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-pioneer-light-card dark:border-slate-800 dark:bg-[#1E293B]">
      <div className="flex h-16 min-h-16 items-center justify-between gap-2 px-3 sm:h-20 sm:min-h-20 sm:px-6 md:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6 md:gap-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4 md:gap-6">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label={t("header.mobile.menuToggle")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 sm:h-10 sm:w-10 lg:hidden dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 rtl:scale-x-[-1]" />
            </button>

            {isStudentShell ? (
              <Link
                to="/"
                title={t("header.dashboardMenu.visitWebsite", { defaultValue: "Visit website" })}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-pioneer-orange-normal/30 bg-pioneer-orange-light text-white hover:text-white md:hidden"
              >
                <Globe className="h-4 w-4" />
              </Link>
            ) : null}

            <div className="hidden min-w-0 items-center gap-4 md:flex lg:gap-6">
              {isStudentShell ? (
                <>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-pioneer-orange-normal/30 bg-pioneer-orange-light px-3 py-1.5 text-xs font-bold text-pioneer-orange-normal transition hover:bg-pioneer-orange-normal hover:text-white dark:border-pioneer-orange-normal/40 dark:bg-pioneer-orange-normal/10"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {t("header.dashboardMenu.visitWebsite", { defaultValue: "Visit website" })}
                  </Link>
                  <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                    <span>{t("header.dashboardMenu.studentPanel", { defaultValue: "Student panel" })}</span>
                  </nav>
                </>
              ) : isInstructorShell ? (
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                  <span>{t("header.dashboardMenu.instructorPanel", { defaultValue: "Instructor panel" })}</span>
                </nav>
              ) : (
                <>
                  <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t("overview.platformStatus")}: {t("overview.allSystemsOk")}
                  </div>
                  <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                    <span>{t("sidebar.adminPanel")}</span>
                    <span className="text-slate-300 dark:text-slate-700">/</span>
                    <span className="text-slate-600 dark:text-slate-300">{t("nav.overview")}</span>
                  </nav>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Language Toggle & Actions — compact on small screens to avoid horizontal overflow */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4 lg:gap-6">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 sm:h-10 sm:w-10 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="flex shrink-0 items-center gap-0.5 rounded-lg p-0.5 sm:gap-1 sm:p-1">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-all sm:px-3 sm:py-1 sm:text-[10px] ${
                currentLng === "en"
                  ? "bg-pioneer-orange text-white"
                  : "border border-slate-200 bg-transparent text-slate-400 dark:border-white/10"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-all sm:px-3 sm:py-1 sm:text-[10px] ${
                currentLng === "ar"
                  ? "bg-pioneer-orange text-white"
                  : "border border-slate-200 bg-transparent text-slate-400 dark:border-white/10"
              }`}
            >
              AR
            </button>
          </div>

          <NotificationBell variant="dashboard" />

          <div className="hidden h-6 w-px bg-slate-200 sm:block dark:bg-white/10" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-expanded={isProfileOpen}
              aria-label={t("header.dropdown.open")}
              className="flex items-center gap-1.5 rounded-xl p-0.5 transition-colors hover:bg-slate-50 sm:gap-3 sm:p-1 dark:hover:bg-white/5"
            >
              <div className="hidden max-w-[8rem] text-end sm:block md:max-w-32">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {user?.fullName || t("header.admin")}
                </p>
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {roleLabel}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200 sm:h-10 sm:w-10 dark:bg-white/5 dark:ring-white/10">
                {user?.avatar ? (
                  <img src={resolveMediaUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {String(user?.fullName || "AD")
                      .split(" ")
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`hidden h-4 w-4 shrink-0 text-slate-500 transition-transform sm:block ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute end-0 z-50 mt-3 w-[min(14rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200 bg-pioneer-light-card p-2 shadow-md sm:mt-4 sm:w-56 dark:border-slate-800 dark:bg-[#1E293B] dark:shadow-2xl dark:shadow-black/50">
                <div className="mb-1 border-b border-slate-100 p-2 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("header.dashboardMenu.accountActions")}
                  </p>
                </div>
                {[
                  ...profileMenuItems.map((item) => ({ ...item, label: t(item.labelKey) })),
                  {
                    icon: Shield,
                    label: t("header.dashboardMenu.switchRole"),
                    onClick: () => setIsProfileOpen(false),
                  },
                  {
                    icon: LogOut,
                    label: t("header.dashboardMenu.logout"),
                    color: "text-rose-500",
                    onClick: handleLogout,
                  },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={item.onClick}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${item.color || "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}



export default Topbar;
