import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Layers, Check, Sparkles, BookOpen, AlertCircle, 
  Loader2, ArrowLeft, RefreshCw, ShoppingCart, Info
} from "lucide-react";
import { usePublicPackages } from "../features/public/hooks";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { resolveMediaUrl } from "../utils/mediaUrl";

// ─── Image Fallback ─────────────────────────────────────────────────────────────
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop";

function getPackageImageUrl(image) {
  return resolveMediaUrl(image) || FALLBACK_IMAGE;
}

// ─── Plan Card ──────────────────────────────────────────────────────────────────
function PackageCard({ pkg, onSelect, isRtl, t }) {
  const [selectedTier, setSelectedTier] = useState(
    pkg.pricingTiers?.find(t => t.isActive) || pkg.pricingTiers?.[0] || null
  );

  const displayTitle = isRtl ? (pkg.titleAr || pkg.title) : (pkg.title || pkg.titleAr);
  const displayDesc = isRtl ? (pkg.descriptionAr || pkg.description) : (pkg.description || pkg.descriptionAr);
  const imageUrl = getPackageImageUrl(pkg.image);

  // Parse lines of description
  const descriptionLines = useMemo(() => {
    if (!displayDesc) return [];
    return displayDesc.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  }, [displayDesc]);

  // Determine active price
  const activePrice = selectedTier ? selectedTier.price : pkg.price;
  const originalPrice = pkg.courses?.reduce((sum, item) => sum + Number(item.course?.price || 0), 0) || 0;
  const hasDiscount = originalPrice > activePrice;
  const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - activePrice) / originalPrice) * 100) : 0;
  const savingsValue = originalPrice - activePrice;

  return (
    <article className="group relative flex flex-col rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-2xl hover:border-orange-500/20 transition-all duration-300 dark:border-white/10 dark:bg-[#1A1A22] overflow-hidden">
      {/* Cover Image Banner */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
        <img 
          src={imageUrl} 
          alt={displayTitle} 
          className="h-full w-full object-cover transition-transform duration-750 group-hover:scale-105"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Recommended Badge */}
        {pkg.isRecommended && (
          <span className="absolute top-4 start-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-[#EE7C11] px-3.5 py-1.5 text-xs font-black text-white shadow-lg">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            {t("subscription.mostPopular", { defaultValue: "Most Popular" })}
          </span>
        )}

        <div className="absolute bottom-4 start-4 end-4">
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/20 px-2.5 py-1 text-[11px] font-black text-orange-300 backdrop-blur-sm">
            <BookOpen className="h-3 w-3" />
            {isRtl ? `${pkg.courses?.length || 0} دورات متضمنة` : `${pkg.courses?.length || 0} courses included`}
          </span>
          <h2 className="mt-2 text-xl font-black text-white leading-snug line-clamp-2">{displayTitle}</h2>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-6 space-y-5">
        
        {/* Brief description text */}
        {descriptionLines.length > 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {descriptionLines[0]}
          </p>
        )}

        {/* Dynamic Included Courses List (Features List) */}
        {pkg.courses && pkg.courses.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isRtl ? "المساقات والمحتويات المتضمنة" : "Courses & Track Contents"}
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {pkg.courses.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/[0.02] p-2.5 border border-slate-100 dark:border-white/5 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-[#EE7C11]">
                      <BookOpen className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350 truncate">
                      {item.course?.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-slate-400 shrink-0">
                    ${item.course?.price || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Tiers Selection */}
        {pkg.pricingTiers && pkg.pricingTiers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isRtl ? "اختر مدة الوصول للدورات" : "Choose access duration"}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {pkg.pricingTiers.map((tier) => {
                const tierName = isRtl ? (tier.nameAr || tier.name) : (tier.name || tier.nameAr);
                const isSelected = selectedTier?.id === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={`rounded-xl border p-2 text-center transition-all ${
                      isSelected 
                        ? "border-[#EE7C11] bg-orange-50/50 text-[#EE7C11] dark:bg-orange-950/10 font-black shadow-sm" 
                        : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-450 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <p className="text-[10px] truncate">{tierName}</p>
                    <p className="text-xs font-extrabold mt-0.5">${tier.price}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pricing Details Panel */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                ${activePrice}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                / {isRtl ? "كامل الدفعة" : "one-time"}
              </span>
            </div>
            {hasDiscount && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-400 line-through">
                  ${originalPrice}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450">
                  {isRtl ? `وفرت $${Math.round(savingsValue)}` : `Saved $${Math.round(savingsValue)}`}
                </span>
              </div>
            )}
          </div>

          {hasDiscount && (
            <span className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 shadow-sm">
              {isRtl ? `خصم ${discountPercent}%` : `${discountPercent}% OFF`}
            </span>
          )}
        </div>

        {/* Checkout Button */}
        <button
          type="button"
          onClick={() => onSelect(pkg.id, selectedTier?.id)}
          className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-[#EE7C11] py-4 text-sm font-black text-white hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20"
        >
          <ShoppingCart className="h-4 w-4" />
          {isRtl ? "اشترك بالباقة الآن" : "Subscribe to Track"}
        </button>
      </div>
    </article>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────────
export default function PublicPackages() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const navigate = useNavigate();
  
  const { data: packages = [], isLoading, isError, refetch } = usePublicPackages();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);

  const handleSubscribe = (packageId, tierId) => {
    const qs = new URLSearchParams({ packageId });
    if (tierId) qs.append("tierId", tierId);
    
    const path = `/student/checkout?${qs.toString()}`;
    if (!isAuthenticated || role !== APP_ROLES.STUDENT) {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0C0C0E] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-500/10 px-4 py-1.5 text-xs font-black text-[#EE7C11]">
            <Layers className="h-4 w-4" />
            {isRtl ? "باقات مخصصة متكاملة" : "Complete Learning Bundles"}
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white md:text-4xl lg:text-5xl">
            {isRtl ? "استثمر في مستقبلك مع" : "Invest in Your Path with"}{" "}
            <span className="text-[#EE7C11]">{isRtl ? "باقاتنا التعليمية" : "Our Bundled Packages"}</span>
          </h1>
          <p className="text-base text-slate-500 max-w-xl mx-auto">
            {isRtl 
              ? "وفر أكثر واحصل على وصول شامل لمجموعة من المساقات المتكاملة والمصممة لتأهيلك لسوق العمل مباشرة."
              : "Save more and unlock group of comprehensive courses tailored to help you land your dream job."}
          </p>
        </div>

        {/* States Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
            <Loader2 className="h-9 w-9 animate-spin text-[#EE7C11]" />
            <p className="text-sm font-semibold">{t("dashboard.common.loading")}</p>
          </div>
        ) : null}

        {isError ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-red-200 bg-red-50/50 py-16 text-center max-w-md mx-auto dark:border-red-900/30 dark:bg-red-950/10">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-base font-bold text-red-700 dark:text-red-400">
              {isRtl ? "فشل تحميل الباقات المتاحة." : "Failed to load packages."}
            </p>
            <button
              onClick={() => void refetch()}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition"
            >
              <RefreshCw className="h-4 w-4" />
              {isRtl ? "إعادة المحاولة" : "Try again"}
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && packages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center max-w-lg mx-auto dark:border-white/10 dark:bg-[#1A1A22]">
            <Layers className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 font-bold">
              {isRtl ? "لا توجد باقات مفعلة حالياً." : "No packages are available yet."}
            </p>
            <Link to="/explore" className="text-sm font-bold text-[#EE7C11] hover:underline flex items-center gap-1">
              {isRtl ? "تصفح الكورسات الفردية" : "Browse individual courses"}
              {isRtl ? <ArrowLeft className="h-4 w-4 rotate-180" /> : <ArrowLeft className="h-4 w-4" />}
            </Link>
          </div>
        ) : null}

        {!isLoading && !isError && packages.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard 
                key={pkg.id} 
                pkg={pkg} 
                onSelect={handleSubscribe} 
                isRtl={isRtl} 
                t={t}
              />
            ))}
          </div>
        ) : null}

        {/* Footer Info */}
        <div className="mt-16 bg-white dark:bg-[#1A1A22] rounded-3xl border border-slate-100 dark:border-white/5 p-6 flex flex-col md:flex-row items-center gap-4 max-w-4xl mx-auto shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/20 text-[#EE7C11]">
            <Info className="h-6 w-6" />
          </div>
          <div className="text-center md:text-start flex-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {isRtl ? "هل لديك أسئلة حول نظام الباقات؟" : "Have questions about our packages?"}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl 
                ? "يمكنك زيارة صفحة الأسئلة الشائعة لمعرفة المزيد حول شروط الاسترجاع، فترات الوصول وإمكانية الترقية."
                : "Visit our FAQ page to understand refund policies, access durations, and upgrading options."}
            </p>
          </div>
          <Link 
            to="/faq" 
            className="shrink-0 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.02] px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            {isRtl ? "الأسئلة الشائعة" : "Read FAQ"}
          </Link>
        </div>

      </div>
    </div>
  );
}
