import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { usePublicCourse } from "../features/public/hooks";
import { getErrorMessage } from "../api/error";
import { postStudentCourseCheckout, validateStudentCoupon } from "../features/student/financials/api";

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);

  const courseId = (searchParams.get("courseId") || "").trim();

  const [localError, setLocalError] = useState("");
  const [flow, setFlow] = useState("form");
  const [orderMeta, setOrderMeta] = useState({ reusedPending: false });
  const [submitting, setSubmitting] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [receiptUrl, setReceiptUrl] = useState("");

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
    isFetched: courseFetched,
  } = usePublicCourse(courseId || undefined);

  useEffect(() => {
    setFlow("form");
    setOrderMeta({ reusedPending: false });
    setLocalError("");
  }, [courseId]);

  const courseAmount = useMemo(() => {
    if (!course?.isLifetimePurchasable) return 0;
    return Number(course.price);
  }, [course]);

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

  if (!courseId) {
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

  const courseMissing = courseFetched && !courseError && !course;

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponMessage(t("checkout.coupon.enterCode"));
      return;
    }
    setCouponValidating(true);
    setCouponMessage("");
    try {
      await validateStudentCoupon({ code, targetType: "COURSE", targetId: courseId });
      setCouponMessage(t("checkout.coupon.applied"));
    } catch (e) {
      setCouponMessage(getErrorMessage(e, t("checkout.coupon.invalid")));
    } finally {
      setCouponValidating(false);
    }
  };

  const handlePurchase = async () => {
    if (!courseId) return;
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
    if (!courseAmount || Number.isNaN(courseAmount)) {
      setLocalError(t("checkout.package.amountInvalid"));
      return;
    }
    setSubmitting(true);
    try {
      const data = await postStudentCourseCheckout(courseId, {
        paymentMethod,
        receiptUrl: url,
      });
      setOrderMeta({ reusedPending: Boolean(data?.reusedPending) });
      setFlow("success");
      toast.success(t("checkout.cohort.successToast", { defaultValue: "Payment submitted." }));
    } catch (e) {
      const status = e?.response?.status;
      if (status === 409) {
        setLocalError(t("checkout.alreadyEnrolled", { defaultValue: "You already own this course." }));
        return;
      }
      setLocalError(getErrorMessage(e, t("checkout.cohort.directSubmitError", { defaultValue: "Could not submit payment." })));
    } finally {
      setSubmitting(false);
    }
  };

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
              {flow === "success" ? t("checkout.cohort.successTitle", { defaultValue: "Payment submitted" }) : t("checkout.title")}
            </h1>
            {flow !== "success" ? <p className="mt-1 text-sm text-slate-600">{t("checkout.subtitle")}</p> : null}
          </div>

          <div className="space-y-6 p-6">
            {flow === "success" ? (
              <>
                <div className="flex justify-center">
                  <CheckCircle2 className="h-14 w-14 text-emerald-600" aria-hidden />
                </div>
                <p className="text-center text-sm leading-relaxed text-slate-600">
                  {t("checkout.cohort.successBody", { defaultValue: "Your payment is pending review. You will get access once approved." })}
                </p>
                {orderMeta.reusedPending ? (
                  <p className="text-center text-sm text-slate-500">{t("checkout.cohort.successPendingNote")}</p>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    to="/student/classes"
                    className="inline-flex items-center justify-center rounded-xl bg-pioneer-orange-normal px-5 py-3 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover"
                  >
                    {t("checkout.goToClasses")}
                  </Link>
                  <Link
                    to={`/courses/${courseId}`}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {t("checkout.cancel")}
                  </Link>
                </div>
              </>
            ) : null}

            {flow !== "success" && courseLoading ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("checkout.loading")}
              </div>
            ) : null}

            {flow !== "success" && courseError ? <p className="text-sm text-red-600">{t("checkout.courseLoadError")}</p> : null}
            {flow !== "success" && courseMissing ? <p className="text-sm text-red-600">{t("checkout.courseNotFound")}</p> : null}

            {flow !== "success" && course && !courseLoading ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("checkout.courseLabel")}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{course.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {course.type === "HYBRID"
                    ? t("courseDetails.type.hybrid", { defaultValue: "Hybrid" })
                    : t("courseDetails.type.recorded", { defaultValue: "Recorded" })}
                </p>
                <p className="mt-2 text-lg font-extrabold text-pioneer-orange-normal">${courseAmount.toFixed(0)}</p>
              </div>
            ) : null}

            {flow !== "success" && course && !course.isLifetimePurchasable ? (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {t("courseDetails.card.notPurchasable", { defaultValue: "This course is not available for purchase." })}
              </div>
            ) : null}

            {flow !== "success" && course?.isLifetimePurchasable ? (
              <>
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
              </>
            ) : null}

            {flow !== "success" && localError ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-[#EE7C11]/10 px-4 py-3 text-sm text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{localError}</span>
              </div>
            ) : null}

            {flow !== "success" && course?.isLifetimePurchasable ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  to={`/courses/${courseId}`}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {t("checkout.cancel")}
                </Link>
                <button
                  type="button"
                  disabled={!course || courseMissing || submitting}
                  onClick={() => void handlePurchase()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal px-5 py-3 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {t("checkout.cohort.payCohort", { price: `$${courseAmount.toFixed(0)}` })}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
