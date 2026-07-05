import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import AuthShell from "../components/auth/AuthShell";
import useAuthStore from "../store/authStore";
import { getErrorMessage } from "../api/error";
import { getEnrollmentCheckoutPath } from "../utils/enrollmentIntent";

const signupSchema = z
  .object({
    fullName: z.string().min(3).max(100),
    email: z.string().min(1).email(),
    phone: z.string().regex(/^\+?[0-9]{7,15}$/).or(z.literal("")).optional(),
    academicLevel: z.string().optional().nullable(),
    password: z
      .string()
      .min(8)
      .regex(/[a-zA-Z]/)
      .regex(/[0-9]/),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 ps-11 pe-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-pioneer-orange-normal focus:bg-white focus:ring-4 focus:ring-pioneer-orange-normal/10 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white dark:focus:bg-[#12121A]";

function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {hint && !error ? <p className="text-xs text-slate-400">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[a-zA-Z]/.test(password),
    /[0-9]/.test(password),
  ].filter(Boolean).length;
  const colours = ["bg-red-400", "bg-pioneer-orange-normal", "bg-emerald-500"];
  return (
    <div className="mt-2 flex gap-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`h-1 flex-1 rounded-full ${i < score ? colours[score - 1] : "bg-slate-200 dark:bg-white/10"}`} />
      ))}
    </div>
  );
}

export default function Signup() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const registerUser = useAuthStore((s) => s.register);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", phone: "", academicLevel: "", password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const user = await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.academicLevel ? { academicLevel: values.academicLevel } : {}),
      });
      const roleName = String(user?.role?.name || user?.role || "").trim().toUpperCase();

      if (roleName === "SUPER_ADMIN" || roleName === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
      if (roleName === "INSTRUCTOR") {
        navigate("/instructor", { replace: true });
        return;
      }

      const enrollmentCheckout = getEnrollmentCheckoutPath(location.search);
      navigate(enrollmentCheckout || "/courses", { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err, t("auth.errors.registerFailed")));
    }
  };

  return (
    <AuthShell
      title={t("auth.signup.title")}
      subtitle={t("auth.signup.subtitle")}
      footer={
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {t("auth.signup.hasAccount")}{" "}
          <Link to={`/login${location.search}`} className="font-bold text-pioneer-orange-normal hover:underline">
            {t("auth.signup.loginLink")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {serverError}
          </div>
        ) : null}

        <Field label={t("auth.signup.fullNameLabel")} error={errors.fullName?.message}>
          <div className="relative">
            <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" autoComplete="name" placeholder={t("auth.signup.fullNamePlaceholder")} className={inputClass} {...register("fullName")} />
          </div>
        </Field>

        <Field label={t("auth.signup.emailLabel")} error={errors.email?.message}>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="email" autoComplete="email" placeholder={t("auth.signup.emailPlaceholder")} className={inputClass} {...register("email")} />
          </div>
        </Field>

        <Field label={t("auth.signup.phoneLabel")} error={errors.phone?.message} hint={t("auth.signup.phoneHint")}>
          <div className="relative">
            <Phone className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="tel" autoComplete="tel" placeholder={t("auth.signup.phonePlaceholder")} className={inputClass} {...register("phone")} />
          </div>
        </Field>

        <Field label={i18n.language?.startsWith("ar") ? "الفرقة الدراسية" : "Academic Year / Level"} error={errors.academicLevel?.message}>
          <select className={inputClass + " bg-white dark:bg-[#0F0F13] cursor-pointer"} {...register("academicLevel")}>
            <option value="">{i18n.language?.startsWith("ar") ? "اختر الفرقة الدراسية..." : "Select Academic Level..."}</option>
            <option value="PREPARATORY">{i18n.language?.startsWith("ar") ? "إعدادي هندسة" : "Preparatory Year (إعدادي هندسة)"}</option>
            <option value="FIRST_YEAR">{i18n.language?.startsWith("ar") ? "الفرقة الأولى" : "First Year (الفرقة الأولى)"}</option>
            <option value="SECOND_YEAR">{i18n.language?.startsWith("ar") ? "الفرقة الثانية" : "Second Year (الفرقة الثانية)"}</option>
            <option value="THIRD_YEAR">{i18n.language?.startsWith("ar") ? "الفرقة الثالثة" : "Third Year (الفرقة الثالثة)"}</option>
            <option value="FOURTH_YEAR">{i18n.language?.startsWith("ar") ? "الفرقة الرابعة / التخرج" : "Fourth Year / Graduation (الفرقة الرابعة)"}</option>
            <option value="GRADUATE">{i18n.language?.startsWith("ar") ? "خريج / محترف" : "Graduate / Professional (خريج)"}</option>
          </select>
        </Field>

        <Field label={t("auth.signup.passwordLabel")} error={errors.password?.message}>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("auth.signup.passwordPlaceholder")}
              className={`${inputClass} pe-11`}
              {...register("password")}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" tabIndex={-1}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={passwordValue} />
        </Field>

        <Field label={t("auth.signup.confirmPasswordLabel")} error={errors.confirmPassword?.message}>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("auth.signup.confirmPasswordPlaceholder")}
              className={`${inputClass} pe-11`}
              {...register("confirmPassword")}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" tabIndex={-1}>
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal text-sm font-black text-white shadow-lg shadow-pioneer-orange-normal/25 transition hover:bg-pioneer-orange-hover disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t("auth.signup.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
