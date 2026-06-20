import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../lib/api";
import { getErrorMessage } from "../api/error";

const schema = z.object({
  email: z.string().min(1, "auth.forgotPassword.errors.required").email("auth.forgotPassword.errors.invalid"),
});

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }) => {
    setServerError("");
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setDone(true);
    } catch (err) {
      setServerError(getErrorMessage(err, t("auth.forgotPassword.errors.generic")));
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      <Link to="/" className="mb-8">
<div className="flex items-center gap-2">
  
        <img
          src="/assets/ChatGPT%20Image%20Mar%2025,%202026,%2002_45_22%20PM%201.svg"
          alt="Engineering Pioneers"
          className="h-12 w-auto"
        />
        <h1 className="text-2xl font-bold text-slate-900">Engineering Pioneers</h1>
            </div>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        {done ? (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pioneer-orange-light">
              <Mail className="h-7 w-7 text-pioneer-orange-normal" />
            </div>
            <h1 className="mt-6 text-xl font-bold text-slate-900">{t("auth.forgotPassword.successTitle")}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("auth.forgotPassword.successBody")}</p>
            <Link
              to="/login"
              className="mt-8 inline-block text-sm font-semibold text-pioneer-orange-normal hover:underline"
            >
              {t("auth.forgotPassword.backToLogin")}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900">{t("auth.forgotPassword.title")}</h1>
            <p className="mt-2 text-sm text-slate-600">{t("auth.forgotPassword.subtitle")}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              {serverError ? (
                <div className="rounded-lg bg-[#EE7C11]/10 px-4 py-3 text-sm text-red-600">{serverError}</div>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700">
                  {t("auth.forgotPassword.emailLabel")}
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("auth.forgotPassword.emailPlaceholder")}
                  className={`w-full rounded-lg border px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pioneer-orange-normal focus:ring-2 focus:ring-pioneer-orange-light ${
                    errors.email ? "border-red-400 bg-[#EE7C11]/10" : "border-slate-300 bg-white"
                  }`}
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-xs text-red-500">{t(errors.email.message)}</p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-pioneer-orange-normal py-3.5 text-sm font-semibold text-white transition hover:bg-pioneer-orange-hover disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("auth.forgotPassword.submit")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              <Link to="/login" className="font-medium text-pioneer-orange-normal hover:underline">
                {t("auth.forgotPassword.backToLogin")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
