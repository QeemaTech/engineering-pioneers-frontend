import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../api/error";
import { useProfileMe, useUpdateAvatar } from "../../features/student/profile/hooks";
import ImageUploader from "../ui/ImageUploader";

/**
 * Profile photo: upload via the shared media endpoint, paste HTTPS URL, or remove.
 * Uses PATCH /profile/me/avatar — available to any authenticated role.
 */
export default function ProfileAvatarEditor({ className = "" }) {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useProfileMe();
  const updateAvatar = useUpdateAvatar();

  const persistAvatar = async (next) => {
    try {
      await updateAvatar.mutateAsync(next || null);
      toast.success(next ? t("settings.avatar.updated") : t("settings.avatar.removed"));
    } catch (ex) {
      toast.error(getErrorMessage(ex, t("settings.avatar.failed")));
    }
  };

  if (isLoading && !profile) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.common.loading")}</p>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-1">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{t("settings.avatar.title")}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t("settings.avatar.hint")}</p>
      </div>
      <ImageUploader
        value={profile?.avatar || ""}
        onChange={(url) => void persistAvatar(url)}
        allowRemove
        allowExternalUrl
        disabled={updateAvatar.isPending}
        variant="avatar"
      />
    </div>
  );
}
