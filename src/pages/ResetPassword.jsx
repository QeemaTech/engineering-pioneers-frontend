import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../lib/api";
import endpoints from "../api/endpoints";
import { getErrorMessage } from "../api/error";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async ({ newPassword }) => {
    setServerError("");
    try {
      await api.post(`${endpoints.auth.resetPassword}/${token}`, { newPassword });
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } catch (err) {
      setServerError(getErrorMessage(err, t("auth.resetPassword.errors.generic", "Reset failed")));
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pioneer-light-bg px-6 py-12 dark:bg-pioneer-dark-bg">
      <Link to="/" className="mb-8">
        <img src="/assets/logo-full.png" alt="Engineering Pioneers" className="h-12 w-auto" />
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-pioneer-dark-card">
        {done ? (
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("auth.resetPassword.successTitle", "Password updated")}
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {t("auth.resetPassword.successBody", "Redirecting to login…")}
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("auth.resetPassword.title", "Set new password")}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("auth.resetPassword.subtitle", "Choose a strong password for your account.")}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              {serverError ? (
                <div className="rounded-lg bg-pioneer-orange-light px-4 py-3 text-sm text-red-600">{serverError}</div>
              ) : null}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("auth.resetPassword.newPassword", "New password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 pe-11 text-sm dark:border-white/10 dark:bg-pioneer-dark-bg dark:text-white"
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword ? (
                  <p className="text-xs text-red-500">{errors.newPassword.message}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("auth.resetPassword.confirmPassword", "Confirm password")}
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm dark:border-white/10 dark:bg-pioneer-dark-bg dark:text-white"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword ? (
                  <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-pioneer-orange py-3.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("auth.resetPassword.submit", "Reset password")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
