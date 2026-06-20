import { Bell, User, Settings, LogOut, Shield, ChevronDown, Sun, Moon, Menu, LayoutDashboard } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useTheme } from "../../contexts/ThemeContext";
import { useLang } from "../../contexts/LangContext";

function Topbar({ onMenuClick }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isAdminShell = pathname.startsWith("/admin");

  const profileMenuItems = useMemo(() => {
    const close = () => setIsProfileOpen(false);
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
  }, [isAdminShell, navigate]);

  const currentLng = lang;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-pioneer-light-card dark:border-white/5 dark:bg-pioneer-dark-card">
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

            <div className="hidden min-w-0 items-center gap-4 md:flex lg:gap-6">
              <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-500">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("overview.platformStatus")}: {t("overview.allSystemsOk")}
              </div>
              
              <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                <span>{t("sidebar.adminPanel")}</span>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-600 dark:text-slate-300">{t("nav.overview")}</span>
              </nav>
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

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-expanded={isNotificationsOpen}
              aria-label={t("header.notifications")}
              className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors sm:h-10 sm:w-10 ${isNotificationsOpen ? "bg-pioneer-orange text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"}`}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute end-2.5 top-2.5 h-2 w-2 rounded-full bg-pioneer-orange ring-2 ring-pioneer-light-card dark:ring-pioneer-dark-card" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute end-0 z-50 mt-3 w-[min(20rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-pioneer-light-card p-3 shadow-md sm:mt-4 sm:w-80 sm:max-w-none sm:p-4 dark:border-white/10 dark:bg-pioneer-dark-card dark:shadow-2xl dark:shadow-black/50 dark:backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">{t("header.notifications")}</h3>
                  <button className="text-[10px] font-bold text-pioneer-orange hover:underline">Mark all read</button>
                </div>
                <div className="space-y-2">
                  {[
                    { title: "New Enrollment", body: "Ahmed Hassan joined HSK 1", time: "2m ago" },
                    { title: "System Update", body: "v2.4 successfully deployed", time: "1h ago" },
                    { title: "Report Ready", body: "April revenue report is ready", time: "3h ago" },
                  ].map((note, i) => (
                    <div key={i} className="group rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{note.title}</p>
                      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{note.body}</p>
                      <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-slate-600">{note.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden h-6 w-px bg-slate-200 sm:block dark:bg-white/10" />

          <div className="hidden flex-col items-end md:flex">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              {t("overview.lastSynced")}: 2 {t("overview.minAgo")}
            </p>
            <div className="h-px w-8 bg-pioneer-orange/30 mt-1" />
          </div>

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
                  {(typeof user?.role === "object" ? user.role.name : user?.role) || "Global Admin"}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200 sm:h-10 sm:w-10 dark:bg-white/5 dark:ring-white/10">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
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
              <div className="absolute end-0 z-50 mt-3 w-[min(14rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200 bg-pioneer-light-card p-2 shadow-md sm:mt-4 sm:w-56 dark:border-white/10 dark:bg-pioneer-dark-card dark:shadow-2xl dark:shadow-black/50">
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
