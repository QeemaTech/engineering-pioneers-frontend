import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bell, Eye, EyeOff, Lock, Save, ShieldCheck, User } from "lucide-react";
import useAuthStore from "../store/authStore";
import { useChangePassword, useProfileMe, useUpdateProfile } from "../features/student/profile/hooks";
import { getErrorMessage } from "../api/error";
import ProfileAvatarEditor from "../components/profile/ProfileAvatarEditor";

/* ── Zod schemas ── */
const profileSchema = z.object({
  fullName: z.string().min(3, "settings.errors.fullNameMin"),
  phone: z
    .string()
    .refine((v) => v === "" || /^\+?[0-9]{7,15}$/.test(String(v)), "settings.errors.phoneMin"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "settings.errors.required"),
    newPassword: z
      .string()
      .min(8, "settings.errors.passwordMin")
      .regex(/[a-zA-Z]/, "settings.errors.passwordMin")
      .regex(/[0-9]/, "settings.errors.passwordMin"),
    confirmPassword: z.string().min(1, "settings.errors.required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "settings.errors.passwordMatch",
    path: ["confirmPassword"],
  });

/* ── Reusable input ── */
function Field({ label, error, type = "text", placeholder, rightElement, ...rest }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-xl border py-3 pe-10 ps-4 text-sm outline-none transition focus:ring-2
            ${error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-pioneer-orange focus:ring-pioneer-teal/30"}
          `}
          {...rest}
        />
        {rightElement && (
          <div className="absolute end-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function PasswordField({ label, error, placeholder, ...rest }) {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();
  return (
    <Field
      label={label}
      error={error}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      rightElement={
        <button type="button" onClick={() => setShow((v) => !v)} className="text-slate-400 hover:text-slate-600">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...rest}
    />
  );
}

/* ── Nav items ── */
const NAV = [
  { key: "profile",       icon: User,         label: "settings.nav.profile"  },
  { key: "security",      icon: ShieldCheck,  label: "settings.nav.security" },
  { key: "notifications", icon: Bell,         label: "settings.nav.notifications"   },
];

/* ── Profile section ── */
function ProfileSection() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading: profileLoading } = useProfileMe(Boolean(user));
  const updateProfile = useUpdateProfile();
  const [saved, setSaved] = useState(false);
  const [apiErr, setApiErr] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? "", phone: user?.phone ?? "" },
  });

  useEffect(() => {
    if (profile) {
      reset({ fullName: profile.fullName ?? "", phone: profile.phone ?? "" });
    }
  }, [profile, reset]);

  const onSubmit = async (values) => {
    setApiErr("");
    try {
      const payload = {
        fullName: values.fullName.trim(),
        ...(values.phone && String(values.phone).trim() !== "" ? { phone: String(values.phone).trim() } : {}),
      };
      await updateProfile.mutateAsync(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setApiErr(getErrorMessage(e, t("settings.errors.saveFailed", { defaultValue: "Could not save profile." })));
    }
  };

  if (profileLoading && !profile) {
    return <p className="text-sm text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
        <ProfileAvatarEditor />
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-base font-bold text-slate-900">{user?.fullName}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label={t("settings.profile.fullName")}
          placeholder={t("settings.profile.fullNamePlaceholder")}
          error={errors.fullName && t(errors.fullName.message)}
          {...register("fullName")}
        />
        <Field
          label={t("settings.profile.email")}
          type="email"
          value={user?.email ?? ""}
          readOnly
          className="cursor-not-allowed bg-slate-50 text-slate-400"
          placeholder={t("settings.profile.emailPlaceholder")}
        />
        <Field
          label={t("settings.profile.phone")}
          placeholder={t("settings.profile.phonePlaceholder")}
          error={errors.phone && t(errors.phone.message)}
          {...register("phone")}
        />
      </div>

      {apiErr ? <p className="text-sm text-red-600">{apiErr}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isDirty || isSubmitting || updateProfile.isPending}
          className="flex items-center gap-2 rounded-xl bg-pioneer-orange px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-opacity-90 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting || updateProfile.isPending ? t("settings.saving") : t("settings.save")}
        </button>
        {saved && <span className="text-sm font-medium text-green-600">{t("settings.saved")}</span>}
      </div>
    </form>
  );
}

/* ── Security section ── */
function SecuritySection() {
  const { t } = useTranslation();
  const changePassword = useChangePassword();
  const [saved, setSaved] = useState(false);
  const [apiErr, setApiErr] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (values) => {
    setApiErr("");
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword,
      });
      reset();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setApiErr(getErrorMessage(e, t("settings.errors.passwordFailed", { defaultValue: "Could not update password." })));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 text-base font-bold text-slate-900">
        <Lock className="h-4 w-4 text-pioneer-orange" />
        {t("settings.security.changePassword")}
      </div>
      <PasswordField
        label={t("settings.security.currentPassword")}
        placeholder={t("settings.security.currentPasswordPlaceholder")}
        error={errors.currentPassword && t(errors.currentPassword.message)}
        {...register("currentPassword")}
      />
      <PasswordField
        label={t("settings.security.newPassword")}
        placeholder={t("settings.security.newPasswordPlaceholder")}
        error={errors.newPassword && t(errors.newPassword.message)}
        {...register("newPassword")}
      />
      <PasswordField
        label={t("settings.security.confirmPassword")}
        placeholder={t("settings.security.confirmPasswordPlaceholder")}
        error={errors.confirmPassword && t(errors.confirmPassword.message)}
        {...register("confirmPassword")}
      />
      {apiErr ? <p className="text-sm text-red-600">{apiErr}</p> : null}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || changePassword.isPending}
          className="flex items-center gap-2 rounded-xl bg-pioneer-orange px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-opacity-90 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting || changePassword.isPending ? t("settings.saving") : t("settings.save")}
        </button>
        {saved && <span className="text-sm font-medium text-green-600">{t("settings.saved")}</span>}
      </div>
    </form>
  );
}

/* ── Notifications section ── */
const NOTIF_KEYS = ["classReminders", "homeworkDeadlines", "examAlerts", "progressReports", "promotions"];

function NotificationsSection() {
  const { t } = useTranslation();
  const [toggles, setToggles] = useState(
    Object.fromEntries(NOTIF_KEYS.map((k) => [k, k !== "promotions"]))
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">{t("settings.notifs.description")}</p>
      {NOTIF_KEYS.map((key) => (
        <div key={key} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold text-slate-800">{t(`settings.notifs.${key}.title`)}</p>
            <p className="text-xs text-slate-500">{t(`settings.notifs.${key}.desc`)}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={toggles[key]}
            onClick={() => setToggles((prev) => ({ ...prev, [key]: !prev[key] }))}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pioneer-orange focus:ring-offset-2
              ${toggles[key] ? "bg-pioneer-orange" : "bg-slate-300"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200
                ${toggles[key] ? "start-[22px]" : "start-0.5"}`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

const SECTIONS = { profile: ProfileSection, security: SecuritySection, notifications: NotificationsSection };

export default function Settings() {
  const { t }       = useTranslation();
  const [tab, setTab] = useState("profile");
  const ActiveSection = SECTIONS[tab];

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            {t("settings.titlePrefix")}{" "}
            <span className="text-pioneer-orange">{t("settings.titleAccent")}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">{t("settings.subtitle")}</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">

          {/* Sidebar nav */}
          <nav className="flex overflow-x-auto gap-1 rounded-2xl border border-slate-100 bg-white p-2 shadow-sm lg:w-52 lg:shrink-0 lg:flex-col lg:overflow-x-visible">
            {NAV.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-colors
                  ${tab === key
                    ? "bg-pioneer-orange/10 text-pioneer-orange"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(label)}
              </button>
            ))}
          </nav>

          {/* Content panel */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-slate-900">{t(`settings.nav.${tab}`)}</h2>
            <ActiveSection />
          </div>
        </div>
      </div>
    </div>
  );
}
