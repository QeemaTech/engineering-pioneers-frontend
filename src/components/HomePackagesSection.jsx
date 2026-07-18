import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layers, Check, Sparkles, BookOpen, ArrowRight, ShoppingCart } from "lucide-react";
import { usePublicPackages } from "../features/public/hooks";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop";

function getPackageImageUrl(image) {
  if (!image) return FALLBACK_IMAGE;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL || ""}${image}`;
}

export default function HomePackagesSection() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const navigate = useNavigate();

  const { data: packages = [], isLoading, isError } = usePublicPackages();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);

  if (isError || (!isLoading && packages.length === 0)) return null;

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

  // Only display top 3 packages in Home Page
  const featuredPackages = packages.slice(0, 3);

  return (
    <section className="bg-slate-50/50 py-16 dark:bg-[#0C0C0E]/50">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-500/10 px-3 py-1 text-xs font-black text-[#EE7C11] mb-3">
              <Layers className="h-3.5 w-3.5" />
              {isRtl ? "الباقات التعليمية" : "Complete Learning Bundles"}
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
              {isRtl ? "وفر أكثر واستثمر في مستقبل مهني" : "Invest in Your Career Track"}{" "}
              <span className="text-[#EE7C11]">{isRtl ? "متكامل" : "With Bundles"}</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              {isRtl 
                ? "مجموعات من الكورسات المترابطة والمنظمة بشكل عملي لتأهيلك مباشرة إلى التخصص المطلوب."
                : "Linked, structured sets of courses configured to land you directly in your target specialty."}
            </p>
          </div>

          <Link
            to="/packages"
            className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#EE7C11] bg-white dark:bg-[#1A1A22] px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all hover:text-[#EE7C11] shrink-0"
          >
            {isRtl ? "عرض كل الباقات" : "Browse all packages"}
            <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180" : ""}`} />
          </Link>
        </div>

        {/* Content/Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="h-[420px] rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200/50 dark:border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredPackages.map((pkg) => {
              const displayTitle = isRtl ? (pkg.titleAr || pkg.title) : (pkg.title || pkg.titleAr);
              const displayDesc = isRtl ? (pkg.descriptionAr || pkg.description) : (pkg.description || pkg.descriptionAr);
              const imageUrl = getPackageImageUrl(pkg.image);
              
              const activePrice = pkg.pricingTiers?.find(t => t.isActive)?.price || pkg.price;
              const originalPrice = pkg.courses?.reduce((sum, item) => sum + Number(item.course?.price || 0), 0) || 0;
              const hasDiscount = originalPrice > activePrice;
              const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - activePrice) / originalPrice) * 100) : 0;
              const savingsValue = originalPrice - activePrice;

              const descriptionLines = displayDesc
                ? displayDesc.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
                : [];

              return (
                <article 
                  key={pkg.id}
                  className="group relative flex flex-col rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-2xl hover:border-orange-500/20 transition-all duration-300 dark:border-white/10 dark:bg-[#1A1A22] overflow-hidden"
                >
                  {/* Cover Image Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    <img 
                      src={imageUrl} 
                      alt={displayTitle} 
                      className="h-full w-full object-cover transition-transform duration-750 group-hover:scale-105"
                      onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    {pkg.isRecommended && (
                      <span className="absolute top-4 start-4 flex items-center gap-1 rounded-full bg-[#EE7C11] px-3 py-1.5 text-[10px] font-black text-white shadow-md">
                        <Sparkles className="h-2.5 w-2.5" />
                        {t("subscription.mostPopular", { defaultValue: "Popular" })}
                      </span>
                    )}

                    <div className="absolute bottom-4 start-4 end-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/20 px-2.5 py-1 text-[10px] font-black text-orange-300 backdrop-blur-sm">
                        <BookOpen className="h-3 w-3" />
                        {isRtl ? `${pkg.courses?.length || 0} دورات` : `${pkg.courses?.length || 0} courses`}
                      </span>
                      <h3 className="mt-1.5 text-base font-black text-white line-clamp-1">{displayTitle}</h3>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5 space-y-4">
                    {/* Brief description */}
                    {descriptionLines.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {descriptionLines[0]}
                      </p>
                    )}

                    {/* Included Courses list */}
                    {pkg.courses && pkg.courses.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          {isRtl ? "المساقات المتضمنة بالمسار" : "Track Courses"}
                        </h4>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                          {pkg.courses.map((item, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-white/[0.02] p-2 border border-slate-100 dark:border-white/5"
                            >
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350 truncate max-w-[80%]">
                                {item.course?.title}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                ${item.course?.price || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price + Button */}
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">${activePrice}</span>
                          {hasDiscount && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold">
                              {isRtl ? `وفرت $${Math.round(savingsValue)}` : `Saved $${Math.round(savingsValue)}`}
                            </span>
                          )}
                        </div>
                        {hasDiscount && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ${originalPrice}
                          </span>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleSubscribe(pkg.id, pkg.pricingTiers?.[0]?.id)}
                        className="rounded-xl bg-[#EE7C11] px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-600 transition flex items-center gap-1 shadow-sm"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {isRtl ? "اشترك" : "Subscribe"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
