import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { usePublicCourse, usePublicPackages } from "../features/public/hooks";
import { useEnrollInCohort } from "../features/student/enrollments/hooks";
import { getErrorMessage } from "../api/error";
import {
  postStudentCohortDirectCheckout,
  postStudentFinancialCheckout,
  validateStudentCoupon,
} from "../features/student/financials/api";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function durationLabel(months) {
  const n = Number(months || 0);
  if (!n) return "-";
  return n === 1 ? "1 month" : `${n} months`;
}

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);

  const cohortId = (searchParams.get("cohortId") || "").trim();
  const courseId = (searchParams.get("courseId") || "").trim();
  const packageId = (searchParams.get("packageId") || "").trim();
  const yearly =
    searchParams.get("yearly") === "true" || searchParams.get("yearly") === "1" || searchParams.get("yearly") === "yes";

  const [localError, setLocalError] = useState("");
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  /** Cohort path: try package quota enroll first; on 403 offer à la carte payment. */
  const [cohortFlow, setCohortFlow] = useState("quota");
  const [cohortDirectSubmitting, setCohortDirectSubmitting] = useState(false);
  const [cohortOrderMeta, setCohortOrderMeta] = useState({ reusedPending: false });

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [packageSubmitting, setPackageSubmitting] = useState(false);

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
    isFetched: courseFetched,
  } = usePublicCourse(courseId || undefined);

  const { data: packages = [], isLoading: packagesLoading } = usePublicPackages();

  const pkg = useMemo(() => packages.find((p) => p.id === packageId) ?? null, [packages, packageId]);

  const cohort = useMemo(() => {
    if (!course || !cohortId) return null;
    return course.availableCohorts?.find((c) => c.id === cohortId) ?? null;
  }, [course, cohortId]);

  const enroll = useEnrollInCohort();

  useEffect(() => {
    setCohortFlow("quota");
    setCohortOrderMeta({ reusedPending: false });
    setLocalError("");
  }, [cohortId, courseId]);

  const isPackageMode = Boolean(packageId);
  const isCohortMode = Boolean(cohortId);

  const packageAmount = useMemo(() => {
    if (!pkg) return 0;
    return Number(pkg.price);
  }, [pkg]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuth) {
    const dest = `/checkout?${searchParams.toString()}`.replace(/\?$/, "");
    const loginTo = searchParams.toString() ? `/login?redirect=${encodeURIComponent(dest)}` : "/login";
    return <Navigate to={loginTo} replace />;
  }

  if (role === APP_ROLES.ADMIN) return <Navigate to="/admin" replace />;
  if (role === APP_ROLES.INSTRUCTOR) return <Navigate to="/instructor" replace />;
  if (role !== APP_ROLES.STUDENT) return <Navigate to="/" replace />;

  if (!isPackageMode && !isCohortMode) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{t("checkout.invalid.title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("checkout.invalid.body")}</p>
        <Link to="/explore" className="mt-6 inline-block font-semibold text-pioneer-orange-normal hover:underline">
          {t("checkout.backExplore")}
        </Link>
      </div>
    );
  }

  const showCourseBlock = Boolean(courseId);
  const courseMissing = showCourseBlock && courseFetched && !courseError && !course;
  const cohortMismatch = isCohortMode && showCourseBlock && course && !courseLoading && !cohort;

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponMessage(t("checkout.coupon.enterCode"));
      return;
    }
    setCouponValidating(true);
    setCouponMessage("");
    try {
      if (isPackageMode && packageId) {
        await validateStudentCoupon({ code, targetType: "SUBSCRIPTION", targetId: packageId });
      } else if (isCohortMode && courseId) {
        await validateStudentCoupon({ code, targetType: "COURSE", targetId: courseId });
      } else {
        setCouponMessage(t("checkout.coupon.contextRequired"));
        return;
      }
      setCouponMessage(t("checkout.coupon.applied"));
    } catch (e) {
      setCouponMessage(getErrorMessage(e, t("checkout.coupon.invalid")));
    } finally {
      setCouponValidating(false);
    }
  };

  const handleCohortConfirm = () => {
    setLocalError("");
    setAlreadyEnrolled(false);
    enroll.mutate(cohortId, {
      onSuccess: () => {
        navigate("/my-classes", { replace: true });
      },
      onError: (err) => {
        const status = err?.response?.status;
        if (status === 403) {
          setCohortFlow("direct");
          return;
        }
        if (status === 409) {
          setAlreadyEnrolled(true);
          setLocalError(t("checkout.alreadyEnrolled"));
          return;
        }
        setLocalError(getErrorMessage(err, t("checkout.genericError")));
      },
    });
  };

  const cohortDirectAmount = cohort ? Number(cohort.price) : 0;

  const handleCohortDirectPurchase = async () => {
    if (!cohortId) return;
    setLocalError("");
    const url = receiptUrl.trim();
    if (!url) {
      setLocalError(t("checkout.package.receiptRequired"));
      return;
    }
    try {
      new URL(url);
    } catch {
      setLocalError(t("checkout.package.receiptUrlInvalid"));
      return;
    }
    if (!cohortDirectAmount || Number.isNaN(cohortDirectAmount)) {
      setLocalError(t("checkout.package.amountInvalid"));
      return;
    }
    setCohortDirectSubmitting(true);
    try {
      const data = await postStudentCohortDirectCheckout(cohortId, {
        paymentMethod,
        receiptUrl: url,
      });
      const reused = Boolean(data?.reusedPending);
      setCohortOrderMeta({ reusedPending: reused });
      setCohortFlow("success");
      toast.success(t("checkout.cohort.successToast"));
    } catch (e) {
      setLocalError(getErrorMessage(e, t("checkout.cohort.directSubmitError")));
    } finally {
      setCohortDirectSubmitting(false);
    }
  };

  const handlePackageSubmit = async () => {
    if (!packageId || !pkg) return;
    setLocalError("");
    const url = receiptUrl.trim();
    if (!url) {
      setLocalError(t("checkout.package.receiptRequired"));
      return;
    }
    try {
      new URL(url);
    } catch {
      setLocalError(t("checkout.package.receiptUrlInvalid"));
      return;
    }
    if (!packageAmount || Number.isNaN(packageAmount)) {
      setLocalError(t("checkout.package.amountInvalid"));
      return;
    }
    setPackageSubmitting(true);
    try {
      await postStudentFinancialCheckout({
        packageId,
        paymentMethod,
        receiptUrl: url,
        amount: packageAmount,
        isYearly: false,
      });
      toast.success(t("checkout.package.successToast"));
      navigate("/subscription", { replace: true });
    } catch (e) {
      setLocalError(getErrorMessage(e, t("checkout.package.submitError")));
    } finally {
      setPackageSubmitting(false);
    }
  };

  const canCohortConfirm =
    isCohortMode &&
    Boolean(cohortId) &&
    !courseMissing &&
    (!showCourseBlock || (cohort && !cohortMismatch));

  const canCohortDirectPay =
    isCohortMode &&
    Boolean(cohortId) &&
    !courseMissing &&
    (!showCourseBlock || (cohort && !cohortMismatch));

  if (isPackageMode) {
    if (packagesLoading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    if (!pkg) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">{t("checkout.package.notFoundTitle")}</h1>
          <p className="mt-2 text-sm text-slate-600">{t("checkout.package.notFoundBody")}</p>
          <Link to="/subscription" className="mt-6 inline-block font-semibold text-pioneer-orange-normal hover:underline">
            {t("checkout.package.backPlans")}
          </Link>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 md:px-6">
          <nav className="mb-6 text-sm text-slate-500">
            <Link to="/subscription" className="font-medium text-pioneer-orange-normal hover:underline">
              {t("checkout.breadcrumbSubscription")}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">{t("checkout.title")}</span>
          </nav>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-pioneer-orange-light/40 to-white px-6 py-5">
              <h1 className="text-2xl font-bold text-slate-900">{t("checkout.package.title")}</h1>
              <p className="mt-1 text-sm text-slate-600">{t("checkout.package.subtitle")}</p>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("checkout.package.planLabel")}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{pkg.name}</p>
                <p className="mt-1 text-2xl font-extrabold text-pioneer-orange-normal">
                  ${packageAmount.toFixed(0)}{" "}
                  <span className="text-sm font-medium text-slate-500">
                    / {durationLabel(pkg.durationMonths)}
                  </span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("checkout.coupon.label")}</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={t("checkout.coupon.placeholder")}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={couponValidating}
                    onClick={() => void handleApplyCoupon()}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                  >
                    {couponValidating ? t("dashboard.common.loading") : t("checkout.coupon.apply")}
                  </button>
                </div>
                {couponMessage ? <p className="mt-2 text-sm text-slate-600">{couponMessage}</p> : null}
              </div>

              <div>
                <label htmlFor="pay-method" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("checkout.package.paymentMethod")}
                </label>
                <select
                  id="pay-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="BANK_TRANSFER">{t("checkout.package.methodBank")}</option>
                  <option value="CARD">{t("checkout.package.methodCard")}</option>
                  <option value="OTHER">{t("checkout.package.methodOther")}</option>
                </select>
              </div>

              <div>
                <label htmlFor="receipt-url" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("checkout.package.receiptUrl")}
                </label>
                <input
                  id="receipt-url"
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">{t("checkout.package.receiptHint")}</p>
              </div>

              {localError ? (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-[#EE7C11]/10 px-4 py-3 text-sm text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{localError}</span>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  to="/subscription"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {t("checkout.cancel")}
                </Link>
                <button
                  type="button"
                  disabled={packageSubmitting}
                  onClick={() => void handlePackageSubmit()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal px-5 py-3 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {packageSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {t("checkout.package.submit")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Cohort enrollment checkout */
  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-2xl px-4 md:px-6">
        <nav className="mb-6 text-sm text-slate-500">
          <Link to="/explore" className="font-medium text-pioneer-orange-normal hover:underline">
            {t("checkout.breadcrumbExplore")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{t("checkout.title")}</span>
        </nav>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-pioneer-orange-light/40 to-white px-6 py-5">
            <h1 className="text-2xl font-bold text-slate-900">
              {cohortFlow === "success"
                ? t("checkout.cohort.successTitle")
                : cohortFlow === "direct"
                  ? t("checkout.cohort.directTitle")
                  : t("checkout.title")}
            </h1>
            {cohortFlow === "success" ? null : (
              <p className="mt-1 text-sm text-slate-600">
                {cohortFlow === "direct" ? null : t("checkout.subtitle")}
              </p>
            )}
          </div>

          <div className="space-y-6 p-6">
            {cohortFlow === "success" ? (
              <>
                <div className="flex justify-center">
                  <CheckCircle2 className="h-14 w-14 text-emerald-600" aria-hidden />
                </div>
                <p className="text-center text-sm leading-relaxed text-slate-600">{t("checkout.cohort.successBody")}</p>
                {cohortOrderMeta.reusedPending ? (
                  <p className="text-center text-sm text-slate-500">{t("checkout.cohort.successPendingNote")}</p>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    to="/my-classes"
                    className="inline-flex items-center justify-center rounded-xl bg-pioneer-orange-normal px-5 py-3 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover"
                  >
                    {t("checkout.goToClasses")}
                  </Link>
                  <Link
                    to={courseId ? `/courses/${courseId}` : "/explore"}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {t("checkout.cancel")}
                  </Link>
                </div>
              </>
            ) : null}

            {cohortFlow !== "success" && showCourseBlock && courseLoading ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("checkout.loading")}
              </div>
            ) : null}

            {cohortFlow !== "success" && showCourseBlock && courseError ? (
              <p className="text-sm text-red-600">{t("checkout.courseLoadError")}</p>
            ) : null}

            {cohortFlow !== "success" && courseMissing ? (
              <p className="text-sm text-red-600">{t("checkout.courseNotFound")}</p>
            ) : null}

            {cohortFlow !== "success" && showCourseBlock && course && !courseLoading ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("checkout.courseLabel")}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{course.title}</p>
              </div>
            ) : null}

            {cohortFlow !== "success" && !showCourseBlock ? (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {t("checkout.noCourseContext")}
              </div>
            ) : null}

            {cohortFlow !== "success" && cohortMismatch ? (
              <div className="rounded-xl border border-red-100 bg-[#EE7C11]/10 px-4 py-3 text-sm text-red-800">
                {t("checkout.cohortMismatch")}
              </div>
            ) : null}

            {cohortFlow !== "success" && (cohort || !showCourseBlock) && !cohortMismatch ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("checkout.cohortSection")}</p>
                {cohort ? (
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>
                      <span className="font-medium text-slate-900">{cohort.name}</span>
                    </li>
                    <li>
                      {t("checkout.type")}: {cohort.type} · {t("checkout.status")}: {cohort.status}
                    </li>
                    <li>
                      {t("checkout.starts")}: {formatDate(cohort.startDate)}
                    </li>
                    {cohort.instructor?.fullName ? (
                      <li>
                        {t("checkout.instructor")}: {cohort.instructor.fullName}
                      </li>
                    ) : null}
                    <li className="text-lg font-extrabold text-pioneer-orange-normal">${Number(cohort.price).toFixed(0)}</li>
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">{t("checkout.cohortIdOnly", { id: cohortId })}</p>
                )}
              </div>
            ) : null}

            {cohortFlow !== "success" && cohortFlow === "direct" ? (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
                <p>{t("checkout.cohort.directIntro")}</p>
                <p className="mt-3 text-base font-extrabold text-pioneer-orange-normal">
                  {t("checkout.cohort.payCohort", { price: `$${cohortDirectAmount.toFixed(0)}` })}
                </p>
              </div>
            ) : null}

            {cohortFlow !== "success" && cohortFlow === "direct" ? (
              <>
                <div>
                  <label htmlFor="cohort-pay-method" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("checkout.package.paymentMethod")}
                  </label>
                  <select
                    id="cohort-pay-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="BANK_TRANSFER">{t("checkout.package.methodBank")}</option>
                    <option value="CARD">{t("checkout.package.methodCard")}</option>
                    <option value="OTHER">{t("checkout.package.methodOther")}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cohort-receipt-url" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("checkout.package.receiptUrl")}
                  </label>
                  <input
                    id="cohort-receipt-url"
                    type="url"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    placeholder="https://"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-slate-500">{t("checkout.package.receiptHint")}</p>
                </div>
                <Link to="/subscription" className="inline-block text-sm font-semibold text-pioneer-orange-normal hover:underline">
                  {t("checkout.cohort.upgradeLink")}
                </Link>
              </>
            ) : null}

            {cohortFlow !== "success" && courseId ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("checkout.coupon.label")}</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={t("checkout.coupon.placeholder")}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={couponValidating}
                    onClick={() => void handleApplyCoupon()}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                  >
                    {couponValidating ? t("dashboard.common.loading") : t("checkout.coupon.apply")}
                  </button>
                </div>
                {couponMessage ? <p className="mt-2 text-sm text-slate-600">{couponMessage}</p> : null}
              </div>
            ) : null}

            {cohortFlow !== "success" && localError ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-[#EE7C11]/10 px-4 py-3 text-sm text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{localError}</span>
              </div>
            ) : null}

            {cohortFlow !== "success" && alreadyEnrolled ? (
              <Link to="/my-classes" className="inline-block text-sm font-semibold text-pioneer-orange-normal hover:underline">
                {t("checkout.goToClasses")}
              </Link>
            ) : null}

            {cohortFlow !== "success" ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  to={courseId ? `/courses/${courseId}` : "/explore"}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {t("checkout.cancel")}
                </Link>
                {cohortFlow === "direct" ? (
                  <button
                    type="button"
                    disabled={!canCohortDirectPay || cohortDirectSubmitting}
                    onClick={() => void handleCohortDirectPurchase()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal px-5 py-3 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cohortDirectSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {t("checkout.cohort.payCohort", { price: `$${cohortDirectAmount.toFixed(0)}` })}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canCohortConfirm || enroll.isPending}
                    onClick={handleCohortConfirm}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal px-5 py-3 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {enroll.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {t("checkout.confirm")}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
