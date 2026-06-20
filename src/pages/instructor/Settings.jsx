import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound, Loader2, Save, UserRound } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import Notice from "../../components/dashboard/Notice";
import { getErrorMessage } from "../../api/error";
import useAuthStore from "../../store/authStore";
import { useChangePassword, useProfileMe, useUpdateProfile } from "../../features/student/profile/hooks";
import ProfileAvatarEditor from "../../components/profile/ProfileAvatarEditor";

const PHONE_RE = /^\+?[0-9]{7,15}$/;

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { data: profile, isLoading, isError, error, refetch } = useProfileMe();
  const updateMut = useUpdateProfile();
  const passwordMut = useChangePassword();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName || "");
    setPhone(profile.phone || "");
    setBio(profile.bio || "");
    setExperience(profile.experience != null ? String(profile.experience) : "");
  }, [profile]);

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200/90 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-violet-400/80 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-violet-500/50 dark:focus:ring-violet-500/15";

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setNotice(null);
    const name = fullName.trim();
    if (name.length < 3) {
      setNotice({ type: "error", message: t("dashboard.instructor.pages.settings.nameMin") });
      return;
    }
    const phoneTrim = phone.trim();
    if (phoneTrim && !PHONE_RE.test(phoneTrim)) {
      setNotice({ type: "error", message: t("dashboard.instructor.pages.settings.phoneInvalid") });
      return;
    }
    const payload = {
      fullName: name,
      bio: bio.trim() || undefined,
    };
    if (phoneTrim) payload.phone = phoneTrim;
    const expTrim = experience.trim();
    if (expTrim !== "") {
      const n = Number.parseInt(expTrim, 10);
      if (Number.isNaN(n) || n < 0) {
        setNotice({ type: "error", message: t("dashboard.instructor.pages.settings.experienceInvalid") });
        return;
      }
      payload.experience = n;
    }

    try {
      await updateMut.mutateAsync(payload);
      toast.success(t("dashboard.instructor.pages.settings.profileSaved"));
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, t("dashboard.instructor.pages.settings.profileError")) });
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setNotice(null);
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setNotice({ type: "error", message: t("dashboard.instructor.pages.settings.passwordFields") });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setNotice({ type: "error", message: t("dashboard.instructor.pages.settings.passwordMismatch") });
      return;
    }
    try {
      await passwordMut.mutateAsync({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      toast.success(t("dashboard.instructor.pages.settings.passwordChanged"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, t("dashboard.instructor.pages.settings.passwordError")) });
    }
  };

  if (isLoading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center text-slate-500 dark:text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </section>
    );
  }

  if (isError || !profile) {
    return (
      <section className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
        {getErrorMessage(error, t("dashboard.instructor.pages.settings.loadError"))}
        <button
          type="button"
          onClick={() => refetch()}
          className="ms-3 rounded-lg bg-[#EE7C11] px-3 py-1 text-xs font-bold text-white"
        >
          {t("dashboard.common.retry")}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title={t("dashboard.instructor.pages.settings.title")}
        subtitle={t("dashboard.instructor.pages.settings.subtitleLive")}
      />
      <Notice type={notice?.type} message={notice?.message} />

      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/80 p-6 shadow-sm dark:border-white/[0.08] dark:from-[#1A1A22] dark:via-[#1A1A22] dark:to-[#12121a]">
        <ProfileAvatarEditor />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={onSaveProfile}
          className="space-y-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/80 p-6 shadow-sm dark:border-white/[0.08] dark:from-[#1A1A22] dark:via-[#1A1A22] dark:to-[#12121a]"
        >
          <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4 dark:border-white/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t("dashboard.instructor.pages.settings.sectionProfile")}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("dashboard.instructor.pages.settings.sectionProfileHint")}</p>
            </div>
          </div>

          <Field label={t("dashboard.instructor.pages.settings.email")}>
            <input type="email" value={profile.email} disabled className={`${inputClass} cursor-not-allowed opacity-70`} />
          </Field>
          <Field label={t("dashboard.instructor.pages.settings.fullName")}>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} autoComplete="name" />
          </Field>
          <Field label={t("dashboard.instructor.pages.settings.phoneOptional")}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="+20..."
              autoComplete="tel"
            />
          </Field>
          <Field label={t("dashboard.instructor.pages.settings.headline")}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={500}
              className={`${inputClass} min-h-[100px] resize-y py-3`}
              placeholder={t("dashboard.instructor.pages.settings.headlinePlaceholder")}
            />
            <p className="text-right text-[10px] text-slate-400">{bio.length}/500</p>
          </Field>
          <Field label={t("dashboard.instructor.pages.settings.experienceYears")}>
            <input
              type="number"
              min={0}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </Field>

          <button
            type="submit"
            disabled={updateMut.isPending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-violet-400 disabled:opacity-60"
          >
            {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("dashboard.instructor.pages.settings.saveProfile")}
          </button>
        </form>

        <form
          onSubmit={onChangePassword}
          className="space-y-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/80 p-6 shadow-sm dark:border-white/[0.08] dark:from-[#1A1A22] dark:via-[#1A1A22] dark:to-[#12121a]"
        >
          <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4 dark:border-white/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t("dashboard.instructor.pages.settings.sectionSecurity")}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("dashboard.instructor.pages.settings.sectionSecurityHint")}</p>
            </div>
          </div>

          <Field label={t("dashboard.instructor.pages.settings.currentPassword")}>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </Field>
          <Field label={t("dashboard.instructor.pages.settings.newPassword")}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </Field>
          <Field label={t("dashboard.instructor.pages.settings.confirmPassword")}>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </Field>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("dashboard.instructor.pages.settings.passwordRules")}</p>

          <button
            type="submit"
            disabled={passwordMut.isPending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-violet-300 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white dark:hover:border-violet-500/40 dark:hover:bg-white/5 disabled:opacity-60"
          >
            {passwordMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {t("dashboard.instructor.pages.settings.updatePassword")}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Settings;
