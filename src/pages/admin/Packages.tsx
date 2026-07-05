import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Layers3,
  Edit3,
  Trash2,
  Sparkles,
  Eye,
  EyeOff,
  BookOpen,
  DollarSign
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import PackageStepperModal from "../../components/admin/PackageStepperModal";
import { getErrorMessage } from "../../api/error";
import {
  useAdminPackage,
  useAdminPackages,
  useCreateAdminPackage,
  useDeleteAdminPackage,
  useUpdateAdminPackage,
} from "../../features/admin/packages/hooks";
import type { AdminPackage } from "../../features/admin/packages/types";

function currency(value: number | string | null | undefined) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function PackageCard({
  pkg,
  onEdit,
  onDelete,
  labels,
  isRtl
}: {
  pkg: any;
  onEdit: () => void;
  onDelete: () => void;
  labels: any;
  isRtl: boolean;
}) {
  const borderTone = pkg.isRecommended
    ? "border-amber-300 ring-4 ring-amber-100/70 dark:border-amber-400/60 dark:ring-amber-400/10"
    : "border-slate-200 dark:border-white/10";

  const displayTitle = isRtl ? (pkg.titleAr || pkg.title) : (pkg.title || pkg.titleAr);
  const displayDescription = isRtl ? (pkg.descriptionAr || pkg.description) : (pkg.description || pkg.descriptionAr);
  
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-[#1A1A22] ${borderTone}`}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#EE7C11] via-amber-400 to-[#3B82F6]" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-black text-slate-950 dark:text-white">{displayTitle}</h2>
            {pkg.isRecommended ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                {labels.recommended}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-xs text-[#EE7C11] font-bold flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {isRtl ? `${pkg.courses?.length || 0} كورس مضاف` : `${pkg.courses?.length || 0} courses included`}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
            pkg.isActive
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
          }`}
        >
          {pkg.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {pkg.isActive ? labels.active : labels.inactive}
        </span>
      </div>

      {/* Pricing Varieties Summary */}
      <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {isRtl ? "خيارات الاشتراك المتاحة" : "Available Varieties"}
        </p>
        <div className="space-y-1.5 mt-1">
          {(pkg.pricingTiers || []).map((tier: any) => (
            <div key={tier.id} className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-white/5 pb-1 last:border-0 last:pb-0">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                {isRtl ? (tier.nameAr || tier.name) : tier.name}
              </span>
              <span className="font-extrabold text-[#EE7C11]">${tier.price}</span>
            </div>
          ))}
          {(pkg.pricingTiers || []).length === 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 italic">{isRtl ? "الافتراضي (شراء دائم)" : "Default (Lifetime)"}</span>
              <span className="font-bold text-slate-800 dark:text-white">${pkg.price}</span>
            </div>
          )}
        </div>
      </div>

      {displayDescription ? (
        <div className="mt-5 min-h-[80px] rounded-2xl border border-slate-100 p-4 dark:border-white/10">
          <p className="mb-1.5 text-xs font-black uppercase tracking-wide text-slate-400">{labels.description}</p>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-350 line-clamp-3 whitespace-pre-wrap">{displayDescription}</p>
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-white/10">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
        >
          <Edit3 className="h-3.5 w-3.5" />
          {labels.edit}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#EE7C11]/10 px-3 text-xs font-bold text-red-600 transition hover:bg-red-150 dark:bg-[#EE7C11]/10 dark:text-red-300 dark:hover:bg-[#EE7C11]/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {labels.delete}
        </button>
      </div>
    </article>
  );
}

function StatCard({
  icon,
  value,
  label,
  bgColor,
  iconColor,
}: {
  icon: ReactElement;
  value: string | number;
  label: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bgColor} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-950 dark:text-white">{value}</p>
        <p className="text-xs font-bold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function PackageSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#1A1A22]">
      <div className="h-6 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-5 h-20 rounded bg-slate-100 dark:bg-slate-900" />
      <div className="mt-5 h-16 rounded bg-slate-100 dark:bg-slate-900" />
      <div className="mt-5 flex justify-end gap-2">
        <div className="h-9 w-20 rounded bg-slate-100 dark:bg-slate-900" />
        <div className="h-9 w-20 rounded bg-slate-100 dark:bg-slate-900" />
      </div>
    </div>
  );
}

function EmptyState({
  onCreate,
  title,
  body,
  action,
}: {
  onCreate: () => void;
  title: string;
  body: string;
  action: string;
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-white/10">
      <Layers3 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
      <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{body}</p>
      <button
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[#EE7C11] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#EE7C11]/25 hover:bg-[#d9700e] transition"
      >
        {action}
      </button>
    </div>
  );
}

export default function AdminPackagesPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { data: packages = [], isLoading } = useAdminPackages();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const { data: pkgDetail } = useAdminPackage(editingId);

  const createMutation = useCreateAdminPackage();
  const updateMutation = useUpdateAdminPackage();
  const deleteMutation = useDeleteAdminPackage();

  const handleSave = async (body: any) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, body });
        toast.success(t("dashboard.common.saved", { defaultValue: "Package updated successfully" }));
      } else {
        await createMutation.mutateAsync(body);
        toast.success(t("dashboard.common.saved", { defaultValue: "Package created successfully" }));
      }
      setPanelOpen(false);
      setEditingId(null);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(t("dashboard.common.saved", { defaultValue: "Deleted successfully" }));
      setDeleteTarget(null);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    }
  };

  const tableLabels = {
    packagePrice: t("adminPages.packages.table.packagePrice"),
    active: t("adminPages.packages.table.active"),
    recommended: t("adminPages.packages.table.recommended", { defaultValue: "Recommended" }),
    edit: t("adminPages.packages.table.edit"),
    delete: t("adminPages.packages.table.delete"),
    inactive: t("adminPages.packages.card.inactive"),
    oneTimePurchase: t("adminPages.packages.card.oneTimePurchase"),
    description: t("adminPages.packages.card.description", { defaultValue: "Description" }),
  };

  const openCreatePanel = () => {
    setEditingId(null);
    setPanelOpen(true);
  };

  const stats = useMemo(() => {
    const activeCount = packages.filter((pkg) => pkg.isActive).length;
    return {
      total: packages.length,
      active: activeCount,
      inactive: packages.length - activeCount,
    };
  }, [packages]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={t("adminPages.packages.title")}
          subtitle={t("adminPages.packages.subtitle")}
        />
        <button
          onClick={openCreatePanel}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#EE7C11] px-5 text-sm font-bold text-white shadow-lg shadow-[#EE7C11]/25 hover:bg-[#d9700e] transition"
        >
          {t("adminPages.packages.addPackage")}
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          icon={<Layers3 className="h-6 w-6" />}
          value={stats.total}
          label={t("adminPages.packages.stats.total")}
          bgColor="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={<Eye className="h-6 w-6" />}
          value={stats.active}
          label={t("adminPages.packages.stats.active", { defaultValue: "Active" })}
          bgColor="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={<EyeOff className="h-6 w-6" />}
          value={stats.inactive}
          label={t("adminPages.packages.stats.inactive", { defaultValue: "Inactive" })}
          bgColor="bg-slate-100 dark:bg-white/5"
          iconColor="text-slate-600 dark:text-slate-400"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-5 xl:grid-cols-3">
          <PackageSkeleton />
          <PackageSkeleton />
          <PackageSkeleton />
        </div>
      ) : packages.length === 0 ? (
        <EmptyState
          onCreate={openCreatePanel}
          title={t("adminPages.packages.emptyState.title")}
          body={t("adminPages.packages.emptyState.body")}
          action={t("adminPages.packages.addPackage")}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              labels={tableLabels}
              isRtl={isRtl}
              onEdit={() => {
                setEditingId(pkg.id);
                setPanelOpen(true);
              }}
              onDelete={() => setDeleteTarget(pkg)}
            />
          ))}
        </div>
      )}

      {/* Course Packages Stepper Dialog Overlay */}
      <PackageStepperModal
        open={panelOpen}
        packageData={pkgDetail}
        onClose={() => {
          setPanelOpen(false);
          setEditingId(null);
        }}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("adminPages.packages.deleteConfirmTitle")}
        message={t("adminPages.packages.deleteConfirmMessage")}
        confirmLabel={t("adminPages.packages.deleteConfirm")}
        cancelLabel={t("adminPages.packages.deleteCancel")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
