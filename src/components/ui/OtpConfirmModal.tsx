import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "../../lib/api";
import endpoints from "../../api/endpoints";

type Props = {
  open: boolean;
  purpose: string;
  title?: string;
  onClose: () => void;
  onVerified: (code: string) => void | Promise<void>;
};

export default function OtpConfirmModal({
  open,
  purpose,
  title,
  onClose,
  onVerified,
}: Props) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);

  if (!open) return null;

  const requestOtp = async () => {
    setRequesting(true);
    try {
      const { data } = await api.post(endpoints.auth.otpRequest, { purpose });
      toast.success(data?.message || t("adminPages.otp.sent", "OTP sent"));
      if (data?.data?.code) {
        toast(`Dev OTP: ${data.data.code}`, { icon: "🔑" });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || t("adminPages.otp.sendFailed", "Failed to send OTP"));
    } finally {
      setRequesting(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error(t("adminPages.otp.invalid", "Enter a 6-digit code"));
      return;
    }
    setLoading(true);
    try {
      await api.post(endpoints.auth.otpVerify, { purpose, code });
      await onVerified(code);
      setCode("");
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || t("adminPages.otp.verifyFailed", "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-pioneer-dark-card">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-pioneer-dark-textPrimary">
          {title || t("adminPages.otp.title", "Confirm with OTP")}
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-pioneer-dark-textSecondary">
          {t("adminPages.otp.description", "A verification code was sent. Enter it to continue.")}
        </p>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-lg tracking-widest dark:border-slate-600 dark:bg-pioneer-dark-bg dark:text-white"
            placeholder="000000"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={requestOtp}
            disabled={requesting}
            className="rounded-lg border border-pioneer-teal px-4 py-2 text-sm font-medium text-pioneer-teal hover:bg-pioneer-teal/10"
          >
            {requesting ? "..." : t("adminPages.otp.resend", "Send code")}
          </button>
          <div className="ms-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading}
              className="rounded-lg bg-pioneer-orange px-4 py-2 text-sm font-semibold text-white hover:bg-pioneer-orange-hover"
            >
              {loading ? "..." : t("adminPages.otp.confirm", "Confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
