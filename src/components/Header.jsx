import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FileText,
  Globe,
  LogOut,
  Menu,
  Phone,
  Settings2,
  TrendingUp,
  Video,
  X,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { useSiteSettings } from "../features/public/siteSettings/hooks";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "../features/student/notifications/hooks";

/* ── Social SVG icons ── */
const FbIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const IgIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const TwIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const LiIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

/* ── Helpers ── */
const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-pioneer-orange-normal font-semibold" : "text-slate-700 hover:text-pioneer-orange-normal"
  }`;

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function UserAvatarMark({ user, className = "", textClassName = "text-sm font-bold" }) {
  const src = user?.avatar;
  if (src) {
    return <img src={src} alt="" className={`rounded-full object-cover ${className}`} />;
  }
  return (
    <div className={`flex items-center justify-center rounded-full bg-pioneer-orange-normal font-bold text-white shadow-md ${textClassName} ${className}`}>
      {getInitials(user?.fullName)}
    </div>
  );
}

/* ── Dropdown animation variants ── */
const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -6,
    transition: { duration: 0.1, ease: "easeIn" },
  },
};

/* ── User Dropdown Menu ── */
function UserDropdown({ user, onClose }) {
  const { t } = useTranslation();
  const navigate  = useNavigate();
  const logout    = useAuthStore((s) => s.logout);

  const menuItems = [
    { icon: BookOpen,       labelKey: "header.dropdown.myClasses",  to: "/student/classes" },
    { icon: Video,          labelKey: "header.dropdown.recordings", to: "/student/live-sessions" },
    { icon: FileText,       labelKey: "header.dropdown.homework",   to: "/student/homework" },
    { icon: ClipboardCheck, labelKey: "header.dropdown.exams",      to: "/student/exams" },
    { icon: TrendingUp,     labelKey: "header.dropdown.progress",   to: "/student/progress" },
    { icon: Settings2,      labelKey: "header.dropdown.settings",   to: "/student/settings" },
  ];

  const handleNav = (to) => {
    navigate(to);
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate("/");
  };

  return (
    <motion.div
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ transformOrigin: "top right" }}
      className="absolute end-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60"
    >
      {/* ── User header ── */}
      <div className="flex items-center gap-3 bg-pioneer-orange-light/60 px-4 py-4">
        <UserAvatarMark user={user} className="h-11 w-11 shrink-0" textClassName="text-sm font-bold" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{user?.fullName}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
      </div>

      {/* ── Menu items ── */}
      <div className="py-1.5">
        {menuItems.map(({ icon: Icon, labelKey, to }) => (
          <button
            key={to}
            type="button"
            onClick={() => handleNav(to)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-pioneer-orange-normal"
          >
            <Icon className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{t(labelKey)}</span>
          </button>
        ))}
      </div>

      {/* ── Separator ── */}
      <div className="mx-4 border-t border-slate-100" />

      {/* ── Logout ── */}
      <div className="py-1.5">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm font-medium text-pioneer-orange-normal transition-colors hover:bg-pioneer-orange-light"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{t("header.dropdown.logout")}</span>
        </button>
      </div>
    </motion.div>
  );
}

/* ── Avatar trigger + dropdown wrapper ── */
function NotificationBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data: items = [], isLoading } = useNotifications();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const unread = (items || []).filter((n) => !n.isRead).length;

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-pioneer-orange-normal"
        aria-label={t("header.notifications")}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute end-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-pioneer-orange-normal px-0.5 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute end-0 top-[calc(100%+8px)] z-50 w-80 max-h-[70vh] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <span className="text-xs font-bold text-slate-800">{t("header.notifications")}</span>
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="text-xs font-semibold text-pioneer-orange-normal hover:underline"
              >
                {t("header.notificationsMarkAll")}
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? <p className="p-4 text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
              {!isLoading && items.length === 0 ? <p className="p-4 text-sm text-slate-500">{t("header.notificationsEmpty")}</p> : null}
              {items.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    if (!n.isRead) markOne.mutate(n.id);
                  }}
                  className={`block w-full border-b border-slate-50 px-3 py-2.5 text-start text-sm transition hover:bg-slate-50 ${n.isRead ? "text-slate-600" : "bg-pioneer-orange-light/30 font-medium text-slate-900"}`}
                >
                  <span className="block font-semibold">{n.title}</span>
                  <span className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function UserMenu() {
  const { t } = useTranslation();
  const user      = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("header.dropdown.open")}
        className="flex items-center gap-2 rounded-full ring-2 ring-transparent transition hover:ring-pioneer-orange-normal/30 focus:outline-none focus:ring-pioneer-orange-normal/40"
      >
        <UserAvatarMark user={user} className="h-9 w-9" textClassName="text-sm font-bold" />
        <ChevronDown
          className={`hidden h-3.5 w-3.5 text-slate-500 transition-transform duration-200 lg:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && <UserDropdown user={user} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════
   Main Header
══════════════════════════════════════ */
export default function Header() {
  const { t, i18n } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isStudent = normalizeRole(user?.role) === APP_ROLES.STUDENT;
  const { settings: site } = useSiteSettings();

  const topSocials = [
    { label: "Facebook", Icon: FbIcon, href: site.social.facebook?.trim() },
    { label: "Instagram", Icon: IgIcon, href: site.social.instagram?.trim() },
    { label: "Twitter", Icon: TwIcon, href: site.social.twitter?.trim() },
    { label: "LinkedIn", Icon: LiIcon, href: site.social.linkedin?.trim() },
  ].filter((s) => s.href);

  const currentLanguage = i18n.language?.startsWith("ar") ? "ar" : "en";
  const toggleLanguage  = () =>
    i18n.changeLanguage(currentLanguage === "ar" ? "en" : "ar");

  const navItems = [
    { to: "/", label: t("header.nav.home") },
    { to: "/explore", label: t("header.nav.explore") },
    { to: "/instructors", label: t("header.nav.instructors", { defaultValue: "Instructors" }) },
    ...(isAuthenticated && isStudent
      ? [{ to: "/student", label: t("header.nav.myDashboard", { defaultValue: "My dashboard" }) }]
      : []),
    ...(isAuthenticated && isStudent ? [{ to: "/instructors", label: t("header.nav.bookPrivate") }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      {/* ── Top Bar ── */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:px-6 lg:px-8">
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-slate-400" />
              {t("header.topbar.visitTime")}
            </span>
            {site.phoneNumber ? (
              <a href={`tel:${site.phoneNumber.replace(/\s/g, "")}`} className="hidden items-center gap-1.5 sm:flex hover:text-pioneer-orange-normal">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span dir="ltr">{site.phoneNumber}</span>
              </a>
            ) : (
              <span className="hidden items-center gap-1.5 sm:flex">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {t("header.topbar.phone")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <div className="flex items-center gap-3">
              {topSocials.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="transition hover:text-pioneer-orange-normal"
                >
                  <Icon />
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-xs transition hover:text-pioneer-orange-normal"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{t("header.topbar.language")}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          {/* Logo */}
          <Link to="/" className="shrink-0">
<div className="flex items-center gap-2">
  
            <img
              src="/assets/ChatGPT%20Image%20Mar%2025,%202026,%2002_45_22%20PM%201.svg"
                alt={t("header.logoAlt")}
                className="h-10 w-auto md:h-12"
              />
              <h1 className="text-2xl font-bold text-slate-900">Engineering Pioneers </h1>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <NavLink key={`${item.to}-${item.label}`} to={item.to} className={navLinkClass} end={item.to === "/"}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions — auth aware */}
          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <UserMenu />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-5 py-2 text-sm font-medium text-slate-700 transition hover:text-pioneer-orange-normal"
                >
                  {t("header.actions.login")}
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-pioneer-orange-normal px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-pioneer-orange-hover"
                >
                  {t("header.actions.signUp")}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            {isAuthenticated ? <NotificationBell /> : null}
            <button
              type="button"
              className="rounded-md p-2 text-slate-700"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={t("header.mobile.menuToggle")}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-3 md:px-6">
              {navItems.map((item) => (
                <NavLink
                  key={`${item.to}-${item.label}`}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2.5 text-sm font-medium text-start transition-colors ${
                      isActive
                        ? "bg-pioneer-orange-light text-pioneer-orange-normal"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}

              {/* Mobile auth section */}
              <div className="border-t border-slate-100 pt-3">
                {isAuthenticated ? (
                  <MobileUserSection onClose={() => setIsMenuOpen(false)} />
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      className="flex-1 rounded-md border border-slate-300 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("header.actions.login")}
                    </Link>
                    <Link
                      to="/signup"
                      className="flex-1 rounded-md bg-pioneer-orange-normal py-2.5 text-center text-sm font-semibold text-white transition hover:bg-pioneer-orange-hover"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("header.actions.signUp")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ── Mobile user section (inside hamburger menu) ── */
function MobileUserSection({ onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);
  const logout   = useAuthStore((s) => s.logout);

  const menuItems = [
    { icon: BookOpen,       labelKey: "header.dropdown.myClasses",  to: "/student/classes" },
    { icon: Video,          labelKey: "header.dropdown.recordings", to: "/student/live-sessions" },
    { icon: FileText,       labelKey: "header.dropdown.homework",   to: "/student/homework" },
    { icon: ClipboardCheck, labelKey: "header.dropdown.exams",      to: "/student/exams" },
    { icon: TrendingUp,     labelKey: "header.dropdown.progress",   to: "/student/progress" },
    { icon: Settings2,      labelKey: "header.dropdown.settings",   to: "/student/settings" },
  ];

  return (
    <div className="space-y-0.5">
      {/* User identity row */}
      <div className="flex items-center gap-3 rounded-xl bg-pioneer-orange-light/60 px-3 py-3 mb-2">
        <UserAvatarMark user={user} className="h-9 w-9 shrink-0" textClassName="text-sm font-bold" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{user?.fullName}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
      </div>

      {menuItems.map(({ icon: Icon, labelKey, to }) => (
        <button
          key={to}
          type="button"
          onClick={() => { navigate(to); onClose(); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-pioneer-orange-normal"
        >
          <Icon className="h-4 w-4 shrink-0 text-slate-400" />
          <span>{t(labelKey)}</span>
        </button>
      ))}

      <button
        type="button"
        onClick={async () => { onClose(); await logout(); navigate("/"); }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-medium text-pioneer-orange-normal transition-colors hover:bg-pioneer-orange-light"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>{t("header.dropdown.logout")}</span>
      </button>
    </div>
  );
}
