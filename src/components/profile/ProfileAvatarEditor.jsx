import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Camera, ImageIcon, Link2, Loader2, Trash2 } from "lucide-react";
import { getErrorMessage } from "../../api/error";
import { useProfileMe, useUpdateAvatar } from "../../features/student/profile/hooks";

const MAX_BYTES = 450 * 1024;

function initialsFromName(name) {
  const parts = String(name || "U").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Profile photo: upload image (stored as data URL), paste HTTPS URL, or remove.
 * Uses PATCH /profile/me/avatar — available to any authenticated role.
 */
export default function ProfileAvatarEditor({ className = "" }) {
  const { t } = useTranslation();
  const fileRef = useRef(null);
  const { data: profile, isLoading } = useProfileMe();
  const updateAvatar = useUpdateAvatar();
  const [urlDraft, setUrlDraft] = useState("");
  const [localErr, setLocalErr] = useState("");

  const displayName = profile?.fullName || "";
  const avatar = profile?.avatar;

  const inputCls =
    "h-10 w-full rounded-xl border border-slate-200/90 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-400/80 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white";

  const onPickFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setLocalErr(t("settings.avatar.notImage"));
      return;
    }
    if (f.size > MAX_BYTES) {
      setLocalErr(t("settings.avatar.tooLarge"));
      return;
    }
    setLocalErr("");
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") return;
      try {
        await updateAvatar.mutateAsync(dataUrl);
        toast.success(t("settings.avatar.updated"));
      } catch (ex) {
        toast.error(getErrorMessage(ex, t("settings.avatar.failed")));
      }
    };
    reader.readAsDataURL(f);
  };

  const onApplyUrl = async () => {
    setLocalErr("");
    const u = urlDraft.trim();
    if (!u) return;
    try {
      new URL(u);
    } catch {
      setLocalErr(t("settings.avatar.badUrl"));
      return;
    }
    try {
      await updateAvatar.mutateAsync(u);
      setUrlDraft("");
      toast.success(t("settings.avatar.updated"));
    } catch (ex) {
      toast.error(getErrorMessage(ex, t("settings.avatar.failed")));
    }
  };

  const onRemove = async () => {
    setLocalErr("");
    try {
      await updateAvatar.mutateAsync(null);
      toast.success(t("settings.avatar.removed"));
    } catch (ex) {
      toast.error(getErrorMessage(ex, t("settings.avatar.failed")));
    }
  };

  if (isLoading && !profile) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.common.loading")}</p>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-20 w-20 rounded-2xl object-cover ring-2 ring-slate-200/80 dark:ring-white/10"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 text-xl font-bold text-violet-700 dark:text-violet-300">
              {initialsFromName(displayName)}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={updateAvatar.isPending}
            className="absolute -bottom-1 -end-1 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 dark:border-white/10 dark:bg-[#1A1A22] dark:text-white dark:hover:bg-white/10"
            aria-label={t("settings.avatar.upload")}
          >
            {updateAvatar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{t("settings.avatar.title")}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("settings.avatar.hint")}</p>
        </div>
      </div>

      {localErr ? <p className="text-xs text-red-600 dark:text-red-400">{localErr}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={updateAvatar.isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white dark:hover:bg-white/5"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          {t("settings.avatar.chooseFile")}
        </button>
        {avatar ? (
          <button
            type="button"
            onClick={() => void onRemove()}
            disabled={updateAvatar.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200/80 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-[#EE7C11]/10 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-[#EE7C11]/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("settings.avatar.remove")}
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("settings.avatar.urlLabel")}
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://…"
            className={`min-w-[200px] flex-1 ${inputCls}`}
          />
          <button
            type="button"
            onClick={() => void onApplyUrl()}
            disabled={updateAvatar.isPending || !urlDraft.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Link2 className="h-3.5 w-3.5" />
            {t("settings.avatar.applyUrl")}
          </button>
        </div>
      </div>
    </div>
  );
}
