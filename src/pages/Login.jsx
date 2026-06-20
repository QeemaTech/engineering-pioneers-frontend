import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import AuthShell from "../components/auth/AuthShell";
import useAuthStore from "../store/authStore";
import { getErrorMessage } from "../api/error";
import { getEnrollmentCheckoutPath, getPostLoginRedirectPath } from "../utils/enrollmentIntent";
import { getDeviceFingerprint, getDeviceMetadata } from "../utils/deviceFingerprint";
import { hasAdminAccess } from "../config/permissions";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 ps-11 pe-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-pioneer-orange-normal focus:bg-white focus:ring-4 focus:ring-pioneer-orange-normal/10 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white dark:focus:bg-[#12121A]";

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", remember: false },
  });

  const onSubmit = async ({ identifier, password }) => {
    setServerError("");
    try {
      const deviceFingerprint = await getDeviceFingerprint();
      const meta = getDeviceMetadata();
      const user = await login({
        identifier,
        password,
        deviceFingerprint,
        deviceName: meta.deviceName,
        os: meta.os,
        userAgent: meta.userAgent,
      });
      const roleName = String(user?.role?.name || user?.role || "").trim().toUpperCase();

      if (hasAdminAccess(user)) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
      if (roleName === "INSTRUCTOR") {
        navigate("/instructor", { replace: true });
        return;
      }

      const enrollmentCheckout = getEnrollmentCheckoutPath(location.search);
      if (enrollmentCheckout) {
        navigate(enrollmentCheckout, { replace: true });
        return;
      }
      const redirectPath = getPostLoginRedirectPath(location.search);
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
        return;
      }

      navigate("/courses", { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err, t("auth.errors.loginFailed")));
    }
  };

  return (
    <AuthShell
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      footer={
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {t("auth.login.noAccount")}{" "}
          <Link to={`/signup${location.search}`} className="font-bold text-pioneer-orange-normal hover:underline">
            {t("auth.login.signUpLink")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {serverError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {serverError}
          </div>
        ) : null}

        <Field label={t("auth.login.emailLabel")} error={errors.identifier?.message}>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              autoComplete="email"
              placeholder={t("auth.login.emailPlaceholder")}
              className={`${inputClass} ${errors.identifier ? "border-red-400" : ""}`}
              {...register("identifier")}
            />
          </div>
        </Field>

        <Field label={t("auth.login.passwordLabel")} error={errors.password?.message}>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t("auth.login.passwordPlaceholder")}
              className={`${inputClass} pe-11 ${errors.password ? "border-red-400" : ""}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" className="rounded accent-pioneer-orange-normal" {...register("remember")} />
            {t("auth.login.rememberMe")}
          </label>
          <Link to="/forgot-password" className="text-sm font-semibold text-pioneer-orange-normal hover:underline">
            {t("auth.login.forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal text-sm font-black text-white shadow-lg shadow-pioneer-orange-normal/25 transition hover:bg-pioneer-orange-hover disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t("auth.login.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
