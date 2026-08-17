import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import PageHeader from "../components/dashboard/PageHeader";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { usePublicCourse, usePublicPackage } from "../features/public/hooks";
import { getErrorMessage } from "../api/error";
import { 
  postStudentCourseCheckout, 
  validateStudentCoupon, 
  fetchLiveSessionDetails, 
  postStudentLiveSessionCheckout,
  postStudentPackageCheckout
} from "../features/student/financials/api";
import { applyCouponDiscount, couponDiscountLabel } from "../features/student/financials/coupon";
import ImageUploader from "../components/ui/ImageUploader";
import { MANUAL_PAYMENT_METHODS, PAYMENT_INSTRUCTIONS, isReceiptPath } from "../utils/manualPayments";

function formatPrice(price, isRtl) {
  const value = Math.round(Number(price) || 0);
  return isRtl ? `${value} جنيه` : `${value} EGP`;
}

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const [searchParams] = useSearchParams();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);

  const courseId = (searchParams.get("courseId") || "").trim();
  const pricingTierId = (searchParams.get("pricingTierId") || "").trim();
  const liveSessionId = (searchParams.get("liveSessionId") || "").trim();
  const packageId = (searchParams.get("packageId") || "").trim();
  const tierId = (searchParams.get("tierId") || "").trim();

  const [localError, setLocalError] = useState("");
  const [flow, setFlow] = useState("form");
  const [orderMeta, setOrderMeta] = useState({ reusedPending: false });
  const [submitting, setSubmitting] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [receiptUrl, setReceiptUrl] = useState("");

  const [liveSession, setLiveSession] = useState(null);
  const [liveSessionLoading, setLiveSessionLoading] = useState(false);
  const [liveSessionError, setLiveSessionError] = useState(false);

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
    isFetched: courseFetched,
  } = usePublicCourse(courseId || undefined);

  const {
    data: packageData,
    isLoading: packageLoading,
    isError: packageError,
    isFetched: packageFetched,
  } = usePublicPackage(packageId || undefined);

  useEffect(() => {
    if (courseId) {
      setFlow("form");
      setOrderMeta({ reusedPending: false });
      setLocalError("");
      setCouponCode("");
      setCouponMessage("");
      setAppliedCoupon(null);
    }
  }, [courseId]);

  useEffect(() => {
    if (packageId) {
      setFlow("form");
      setOrderMeta({ reusedPending: false });
      setLocalError("");
      setCouponCode("");
      setCouponMessage("");
      setAppliedCoupon(null);
    }
  }, [packageId]);

  useEffect(() => {
    if (liveSessionId) {
      setFlow("form");
      setOrderMeta({ reusedPending: false });
      setLocalError("");
      setLiveSessionLoading(true);
      setLiveSessionError(false);
      fetchLiveSessionDetails(liveSessionId)
        .then(setLiveSession)
        .catch((err) => {
          console.error(err);
          setLiveSessionError(true);
        })
        .finally(() => setLiveSessionLoading(false));
    }
  }, [liveSessionId]);

  const selectedTier = useMemo(() => {
    if (!pricingTierId || !course?.pricingTiers) return null;
    return course.pricingTiers.find((t) => t.id === pricingTierId);
  }, [course, pricingTierId]);

  const selectedPackageTier = useMemo(() => {
    if (!tierId || !packageData?.pricingTiers) return null;
    return packageData.pricingTiers.find((t) => t.id === tierId);
  }, [packageData, tierId]);

  const courseAmount = useMemo(() => {
    if (packageId) {
      if (selectedPackageTier) return Number(selectedPackageTier.price);
      return Number(packageData?.price || 0);
    }
    if (liveSessionId) return Number(liveSession?.price || 0);
    if (selectedTier) return Number(selectedTier.price);
    if (!course?.isLifetimePurchasable) return 0;
    return Number(course.price);
  }, [course, selectedTier, liveSession, liveSessionId, packageId, packageData, selectedPackageTier]);

  const finalAmount = useMemo(() => {
    if (!courseAmount) return 0;
    if (liveSessionId || packageId) return courseAmount; // No coupons for live sessions or packages yet
    return appliedCoupon ? applyCouponDiscount(courseAmount, appliedCoupon) : courseAmount;
  }, [courseAmount, appliedCoupon, liveSessionId, packageId]);

  const discountAmount = useMemo(() => Math.max(0, courseAmount - finalAmount), [courseAmount, finalAmount]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
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

  if (!courseId && !liveSessionId && !packageId) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{t("checkout.invalid.title")}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("checkout.invalid.body")}</p>
        <Link to="/explore" className="mt-6 inline-block font-semibold text-[#EE7C11] hover:underline">
          {t("checkout.backExplore")}
        </Link>
      </div>
    );
  }

  const courseMissing = courseId && courseFetched && !courseError && !course;
  const liveSessionMissing = liveSessionId && !liveSessionLoading && !liveSessionError && !liveSession;
  const packageMissing = packageId && packageFetched && !packageError && !packageData;

  const priceLabel = formatPrice(finalAmount, isRtl);
  const originalPriceLabel = formatPrice(courseAmount, isRtl);
  const discountLabel = formatPrice(discountAmount, isRtl);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponMessage(t("checkout.coupon.enterCode"));
      setAppliedCoupon(null);
      return;
    }
    setCouponValidating(true);
    setCouponMessage("");
    try {
      const coupon = await validateStudentCoupon({ code, targetType: "COURSE", targetId: courseId });
      setAppliedCoupon(coupon);
      const discounted = applyCouponDiscount(courseAmount, coupon);
      setCouponMessage(
        t("checkout.coupon.appliedWithDiscount", {
          discount: couponDiscountLabel(coupon, isRtl),
          price: formatPrice(discounted, isRtl),
          defaultValue: `Coupon applied — ${couponDiscountLabel(coupon, isRtl)} off. New total: ${formatPrice(discounted, isRtl)}`,
        })
      );
    } catch (e) {
      setAppliedCoupon(null);
      setCouponMessage(getErrorMessage(e, t("checkout.coupon.invalid")));
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
  };

  const handlePurchase = async () => {
    if (!courseId && !liveSessionId && !packageId) return;
    setLocalError("");
    const url = receiptUrl.trim();
    if (!url) {
      setLocalError(t("checkout.package.receiptRequired"));
      return;
    }
    if (!isReceiptPath(url) && !/^https?:\/\//i.test(url)) {
      setLocalError(t("checkout.package.receiptUrlInvalid"));
      return;
    }
    if (!finalAmount && finalAmount !== 0) {
      setLocalError(t("checkout.package.amountInvalid"));
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        paymentMethod,
        receiptUrl: url,
        amount: finalAmount,
      };

      if (packageId) {
        if (tierId) {
          payload.pricingTierId = tierId;
        }
        const data = await postStudentPackageCheckout(packageId, payload);
        setOrderMeta({ reusedPending: Boolean(data?.reusedPending), enrolledInstantly: Boolean(data?.enrolledInstantly) });
        setFlow("success");
        toast.success(isRtl ? "تم إرسال طلب الدفع للباقة بنجاح." : "Package purchase request submitted.");
      } else if (liveSessionId) {
        const data = await postStudentLiveSessionCheckout(liveSessionId, payload);
        setOrderMeta({ reusedPending: Boolean(data?.reusedPending), enrolledInstantly: Boolean(data?.enrolledInstantly) });
        setFlow("success");
        toast.success(isRtl ? "تم إرسال طلب الحجز بنجاح." : "Seat booking request submitted.");
      } else {
        if (pricingTierId) {
          payload.pricingTierId = pricingTierId;
        }
        if (appliedCoupon?.code) {
          payload.couponCode = appliedCoupon.code;
        } else if (couponCode.trim()) {
          payload.couponCode = couponCode.trim();
        }
        const data = await postStudentCourseCheckout(courseId, payload);
        setOrderMeta({ reusedPending: Boolean(data?.reusedPending), enrolledInstantly: Boolean(data?.enrolledInstantly) });
        setFlow("success");
        toast.success(t("checkout.cohort.successToast", { defaultValue: "Payment submitted." }));
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 409) {
        setLocalError(isRtl ? "أنت بالفعل مشترك في هذا المحتوى." : "You already have access to this.");
        return;
      }
      setLocalError(getErrorMessage(e, t("checkout.cohort.directSubmitError", { defaultValue: "Could not submit payment." })));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <nav className="text-sm text-slate-500">
        <Link to="/explore" className="font-medium text-[#EE7C11] hover:underline">
          {t("checkout.breadcrumbExplore")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">{t("checkout.title")}</span>
      </nav>

      <PageHeader
        title={flow === "success" ? t("checkout.cohort.successTitle", { defaultValue: "Payment submitted" }) : t("checkout.title")}
        subtitle={flow !== "success" ? t("checkout.subtitle") : undefined}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
        <div className="space-y-6 p-6">
          {flow === "success" ? (
            <>
              <div className="flex justify-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-600" aria-hidden />
              </div>
              <p className="text-center text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {orderMeta.enrolledInstantly
                  ? t("checkout.cohort.instantBody", { defaultValue: "Access is ready." })
                  : t("checkout.cohort.successBody", { defaultValue: "Your payment is pending Super Admin review. You will get access only after approval." })}
              </p>
              {orderMeta.reusedPending ? (
                <p className="text-center text-sm text-slate-500">{t("checkout.cohort.successPendingNote")}</p>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/student/payments"
                  className="inline-flex items-center justify-center rounded-xl bg-[#EE7C11] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  {t("checkout.viewPayments", { defaultValue: "View payments" })}
                </Link>
                {orderMeta.enrolledInstantly ? (
                  <Link
                    to={liveSessionId ? "/student/live-sessions" : "/student/classes"}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {t("checkout.goToClasses")}
                  </Link>
                ) : (
                  <Link
                    to="/student/tickets"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {t("checkout.openTicket", { defaultValue: "Open a support ticket" })}
                  </Link>
                )}
              </div>
            </>
          ) : null}

          {flow !== "success" && (courseLoading || liveSessionLoading || packageLoading) ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("checkout.loading")}
            </div>
          ) : null}

          {flow !== "success" && courseError ? <p className="text-sm text-red-600">{t("checkout.courseLoadError")}</p> : null}
          {flow !== "success" && packageError ? <p className="text-sm text-red-600">{isRtl ? "فشل تحميل تفاصيل الباقة." : "Error loading package details."}</p> : null}
          {flow !== "success" && liveSessionError ? <p className="text-sm text-red-600">{isRtl ? "عذراً، فشل تحميل تفاصيل الحصة المباشرة." : "Error loading live session details."}</p> : null}
          
          {flow !== "success" && courseMissing ? <p className="text-sm text-red-600">{t("checkout.courseNotFound")}</p> : null}
          {flow !== "success" && packageMissing ? <p className="text-sm text-red-600">{isRtl ? "الباقة المطلوبة غير موجودة." : "Package not found."}</p> : null}
          {flow !== "success" && liveSessionMissing ? <p className="text-sm text-red-600">{isRtl ? "لم يتم العثور على الحصة المباشرة المطلوبة." : "Live session not found."}</p> : null}

          {flow !== "success" && course && !courseLoading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("checkout.courseLabel")}</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{course.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {course.type === "HYBRID"
                  ? t("courseDetails.type.hybrid", { defaultValue: "Hybrid" })
                  : t("courseDetails.type.recorded", { defaultValue: "Recorded" })}
                {selectedTier ? ` · ${isRtl ? (selectedTier.nameAr || selectedTier.name) : selectedTier.name}` : ""}
              </p>
              <p className="mt-2 text-lg font-extrabold text-[#EE7C11]">{priceLabel}</p>
              {appliedCoupon && discountAmount > 0 ? (
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-slate-500 line-through dark:text-slate-400">
                    {t("checkout.coupon.originalPrice", { defaultValue: "Original price" })}: {originalPriceLabel}
                  </p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {t("checkout.coupon.discount", { defaultValue: "Discount" })}: −{discountLabel} ({appliedCoupon.code})
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {flow !== "success" && packageData && !packageLoading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{isRtl ? "الباقة التعليمية" : "Learning Package"}</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {isRtl ? (packageData.titleAr || packageData.title) : (packageData.title || packageData.titleAr)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {isRtl ? `${packageData.courses?.length || 0} دورات متضمنة` : `${packageData.courses?.length || 0} courses included`}
                {selectedPackageTier ? ` · ${isRtl ? (selectedPackageTier.nameAr || selectedPackageTier.name) : selectedPackageTier.name}` : ""}
              </p>
              <p className="mt-2 text-lg font-extrabold text-[#EE7C11]">{priceLabel}</p>
            </div>
          ) : null}

          {flow !== "success" && liveSession && !liveSessionLoading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{isRtl ? "الحصة المباشرة" : "Live Session"}</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{liveSession.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {isRtl ? "المحاضر: " : "Instructor: "} {liveSession.instructor?.fullName || "—"}
              </p>
              <p className="mt-2 text-lg font-extrabold text-[#EE7C11]">{priceLabel}</p>
            </div>
          ) : null}

          {flow !== "success" && course && !course.isLifetimePurchasable ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              {t("courseDetails.card.notPurchasable", { defaultValue: "This course is not available for purchase." })}
            </div>
          ) : null}

          {flow !== "success" && ((course && course.isLifetimePurchasable) || (liveSession && liveSession.canCheckout) || packageData) ? (
            <>
              {courseId ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("checkout.coupon.label")}</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        if (appliedCoupon) {
                          setAppliedCoupon(null);
                          setCouponMessage("");
                        }
                      }}
                      placeholder={t("checkout.coupon.placeholder")}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
                    />
                    <button
                      type="button"
                      disabled={couponValidating}
                      onClick={() => void handleApplyCoupon()}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-[#0F172A] dark:text-white dark:hover:bg-slate-800"
                    >
                      {couponValidating ? t("dashboard.common.loading") : t("checkout.coupon.apply")}
                    </button>
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-650 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-350 dark:hover:bg-slate-800"
                      >
                        {t("checkout.coupon.remove", { defaultValue: "Remove" })}
                      </button>
                    ) : null}
                  </div>
                  {couponMessage ? (
                    <p className={`mt-2 text-sm ${appliedCoupon ? "font-medium text-green-700 dark:text-green-400" : "text-slate-600 dark:text-slate-400"}`}>
                      {couponMessage}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label htmlFor="pay-method" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("checkout.package.paymentMethod")}
                </label>
                <select
                  id="pay-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
                >
                  {MANUAL_PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {isRtl ? method.labelAr : method.labelEn}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  {isRtl ? PAYMENT_INSTRUCTIONS[paymentMethod]?.ar : PAYMENT_INSTRUCTIONS[paymentMethod]?.en}
                </p>
              </div>

              <ImageUploader
                kind="receipt"
                required
                value={receiptUrl}
                onChange={setReceiptUrl}
                label={t("checkout.package.receiptUpload", { defaultValue: "Payment proof" })}
                helperText={t("checkout.package.receiptHint", { defaultValue: "Upload a screenshot of your transfer." })}
              />
            </>
          ) : null}

          {flow !== "success" && localError ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-[#EE7C11]/10 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{localError}</span>
            </div>
          ) : null}

          {flow !== "success" && ((course && course.isLifetimePurchasable) || (liveSession && liveSession.canCheckout) || packageData) ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                to={packageId ? "/packages" : (liveSessionId ? "/student/live-sessions" : `/courses/${courseId}`)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("checkout.cancel")}
              </Link>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handlePurchase()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EE7C11] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {liveSessionId 
                  ? (isRtl ? `احجز مقعدك (${priceLabel})` : `Book Seat (${priceLabel})`) 
                  : t("checkout.cohort.payCohort", { price: priceLabel })}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
