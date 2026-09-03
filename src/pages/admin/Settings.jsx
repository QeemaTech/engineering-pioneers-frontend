import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Save, ShieldAlert, Globe, Lock, Palette, Share2 } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useAdminSettings, useUpdateAdminSettings } from "../../features/admin/settings/hooks";
import { getErrorMessage } from "../../api/error";

function settingToString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function settingToBool(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "boolean") return value;
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return fallback;
}

function SettingsSection({ title, icon: Icon, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Icon className="h-4 w-4 text-slate-500" />
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{title}</h3>
      </div>
      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]">
        {children}
      </div>
    </div>
  );
}

function SettingsToggle({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? "bg-[#EE7C11]" : "bg-slate-300 dark:bg-slate-700"}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

function SettingsInputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#EE7C11] focus:ring-1 focus:ring-[#3B82F6]/30 dark:border-white/10 dark:bg-[#1E293B] dark:text-white dark:focus:border-[#EE7C11] dark:focus:ring-[#3B82F6]/30"
      />
    </div>
  );
}

function Settings() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useAdminSettings();
  const updateMutation = useUpdateAdminSettings();
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Engineering Pioneers",
    siteEmail: "",
    phoneNumber: "",
    socialFacebook: "",
    socialTwitter: "",
    socialInstagram: "",
    socialLinkedin: "",
    socialTelegram: "",
    socialYoutube: "",
    supportWhatsapp: "",
    enableRegistration: true,
    maintenanceMode: false,
    theme: "dark",
    notifications: true,
  });

  useEffect(() => {
    if (data === undefined) return;
    const rows = Array.isArray(data) ? data : [];
    if (!rows.length) {
      setHydrated(true);
      return;
    }
    const g = (key, fb = "") => {
      const row = rows.find((s) => s.key === key);
      return row ? settingToString(row.value) : fb;
    };
    const phone = g("PHONE_NUMBER") || g("SUPPORT_PHONE");
    setSettings((prev) => ({
      ...prev,
      siteName: g("SITE_NAME", prev.siteName),
      siteEmail: g("CONTACT_EMAIL", prev.siteEmail),
      phoneNumber: phone || prev.phoneNumber,
      socialFacebook: g("SOCIAL_FACEBOOK_URL", prev.socialFacebook),
      socialTwitter: g("SOCIAL_TWITTER_URL", prev.socialTwitter),
      socialInstagram: g("SOCIAL_INSTAGRAM_URL", prev.socialInstagram),
      socialLinkedin: g("SOCIAL_LINKEDIN_URL", prev.socialLinkedin),
      socialTelegram: g("SOCIAL_TELEGRAM_URL", prev.socialTelegram),
      socialYoutube: g("SOCIAL_YOUTUBE_URL", prev.socialYoutube),
      supportWhatsapp: g("SUPPORT_WHATSAPP_URL", prev.supportWhatsapp),
      enableRegistration: settingToBool(rows.find((s) => s.key === "ENABLE_REGISTRATION")?.value, prev.enableRegistration),
      maintenanceMode: settingToBool(rows.find((s) => s.key === "MAINTENANCE_MODE")?.value, prev.maintenanceMode),
      theme: g("DEFAULT_THEME", prev.theme) || prev.theme,
      notifications: settingToBool(rows.find((s) => s.key === "NOTIFICATIONS_ENABLED")?.value, prev.notifications),
    }));
    setHydrated(true);
  }, [data]);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const savePayload = () => ({
    SITE_NAME: settings.siteName,
    CONTACT_EMAIL: settings.siteEmail,
    PHONE_NUMBER: settings.phoneNumber,
    SUPPORT_PHONE: settings.phoneNumber,
    SOCIAL_FACEBOOK_URL: settings.socialFacebook,
    SOCIAL_TWITTER_URL: settings.socialTwitter,
    SOCIAL_INSTAGRAM_URL: settings.socialInstagram,
    SOCIAL_LINKEDIN_URL: settings.socialLinkedin,
    SOCIAL_TELEGRAM_URL: settings.socialTelegram,
    SOCIAL_YOUTUBE_URL: settings.socialYoutube,
    SUPPORT_WHATSAPP_URL: settings.supportWhatsapp,
    ENABLE_REGISTRATION: settings.enableRegistration,
    MAINTENANCE_MODE: settings.maintenanceMode,
    DEFAULT_THEME: settings.theme,
    NOTIFICATIONS_ENABLED: settings.notifications,
  });

  const handleSave = () => {
    updateMutation.mutate(savePayload(), {
      onSuccess: () => toast.success(t("dashboard.admin.pages.settings.saved", { defaultValue: "Settings saved" })),
      onError: (e) => toast.error(getErrorMessage(e, "Failed to save settings.")),
    });
  };

  return (
    <section className="max-w-4xl space-y-8 pb-12">
      <PageHeader
        title={t("dashboard.admin.pages.settings.title")}
        subtitle={t("dashboard.admin.pages.settings.subtitle")}
        actions={
          <button
            type="button"
            disabled={updateMutation.isPending || !hydrated || isLoading}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EE7C11] px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-[#EE7C11]/20 transition-all hover:bg-[#d9700e] active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {t("common.save", { defaultValue: "Save changes" })}
          </button>
        }
      />
      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-[#1A1A22]">
          Loading settings...
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-lg border border-red-200 bg-[#EE7C11]/10 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
          {getErrorMessage(error, "Failed to load settings.")}
          <button type="button" onClick={() => refetch()} className="ms-2 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white">
            Retry
          </button>
        </div>
      ) : null}

      <div className="space-y-10">
        <SettingsSection title="Contact & public site" icon={Share2}>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Shown in the marketing header, footer, and contact links. Leave a social URL empty to hide that icon.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <SettingsInputField label="Public contact email" value={settings.siteEmail} onChange={(v) => setSettings((p) => ({ ...p, siteEmail: v }))} placeholder="hello@engineeringpioneers.com" type="email" />
            <SettingsInputField label="Phone (header)" value={settings.phoneNumber} onChange={(v) => setSettings((p) => ({ ...p, phoneNumber: v }))} placeholder="+1-800-000-0000" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <SettingsInputField label="Facebook URL" value={settings.socialFacebook} onChange={(v) => setSettings((p) => ({ ...p, socialFacebook: v }))} placeholder="https://facebook.com/..." type="url" />
            <SettingsInputField label="X (Twitter) URL" value={settings.socialTwitter} onChange={(v) => setSettings((p) => ({ ...p, socialTwitter: v }))} placeholder="https://x.com/..." type="url" />
            <SettingsInputField label="Instagram URL" value={settings.socialInstagram} onChange={(v) => setSettings((p) => ({ ...p, socialInstagram: v }))} placeholder="https://instagram.com/..." type="url" />
            <SettingsInputField label="LinkedIn URL" value={settings.socialLinkedin} onChange={(v) => setSettings((p) => ({ ...p, socialLinkedin: v }))} placeholder="https://linkedin.com/..." type="url" />
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <SettingsInputField label="WhatsApp Direct / Support" value={settings.supportWhatsapp} onChange={(v) => setSettings((p) => ({ ...p, supportWhatsapp: v }))} placeholder="https://wa.me/..." type="url" />
            <SettingsInputField label="Telegram Channel / Group" value={settings.socialTelegram} onChange={(v) => setSettings((p) => ({ ...p, socialTelegram: v }))} placeholder="https://t.me/..." type="url" />
            <SettingsInputField label="YouTube Channel URL" value={settings.socialYoutube} onChange={(v) => setSettings((p) => ({ ...p, socialYoutube: v }))} placeholder="https://youtube.com/@..." type="url" />
          </div>
        </SettingsSection>

        <SettingsSection title="General Settings" icon={Globe}>
          <div className="grid gap-6 sm:grid-cols-2">
            <SettingsInputField label="Site Name" value={settings.siteName} onChange={(v) => setSettings((p) => ({ ...p, siteName: v }))} placeholder="Engineering Pioneers" />
          </div>
          <SettingsToggle
            label="Public Registration"
            description="Allow new students to create accounts"
            enabled={settings.enableRegistration}
            onChange={() => handleToggle("enableRegistration")}
          />
        </SettingsSection>

        <SettingsSection title="Interface & Experience" icon={Palette}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Default Theme</p>
                <p className="text-xs text-slate-500">Choose the default appearance for new users</p>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => setSettings((p) => ({ ...p, theme: e.target.value }))}
                className="h-10 appearance-none rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#1A1A22] dark:text-white dark:focus:border-[#EE7C11]"
              >
                <option value="dark">Dark Theme (Premium)</option>
                <option value="light">Light Theme</option>
              </select>
            </div>
            <SettingsToggle
              label="System Notifications"
              description="Receive alerts about new enrollments and payouts"
              enabled={settings.notifications}
              onChange={() => handleToggle("notifications")}
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Security" icon={Lock}>
          <div className="space-y-6">
            <SettingsToggle
              label="Maintenance Mode"
              description="Disable frontend access for maintenance"
              enabled={settings.maintenanceMode}
              onChange={() => handleToggle("maintenanceMode")}
            />
            <button type="button" className="text-sm font-bold text-[#EE7C11] hover:underline">
              Configure 2FA for Administrators →
            </button>
          </div>
        </SettingsSection>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">Danger Zone</h3>
          </div>
          <div className="rounded-xl border border-red-900/40 bg-red-950/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Clear System Cache</p>
                <p className="text-xs text-slate-500">This will force a refresh of all static data</p>
              </div>
              <button type="button" className="rounded-lg border border-red-900/50 px-4 py-2 text-xs font-bold text-red-500 transition-all hover:bg-red-900/20">
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Settings;
