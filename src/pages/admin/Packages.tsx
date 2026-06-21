import { useEffect, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  BookOpenCheck,
  Check,
  DollarSign,
  Edit3,
  Eye,
  EyeOff,
  Layers3,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import SlideOver from "../../components/ui/SlideOver";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
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

function durationLabel(months?: number) {
  const n = Number(months || 0);
  if (!n) return "-";
  return n === 1 ? "1 month" : `${n} months`;
}

function PackageCard({
  pkg,
  onEdit,
  onDelete,
  labels,
}: {
  pkg: AdminPackage;
  onEdit: () => void;
  onDelete: () => void;
  labels: {
    packagePrice: string;
    active: string;
    edit: string;
    delete: string;
    inactive: string;
    oneTimePurchase: string;
    description: string;
    recommended: string;
  };
}) {
  const borderTone = pkg.isRecommended
    ? "border-amber-300 ring-4 ring-amber-100/70 dark:border-amber-400/60 dark:ring-amber-400/10"
    : "border-slate-200 dark:border-white/10";

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-[#1A1A22] ${borderTone}`}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#EE7C11] via-amber-400 to-[#3B82F6]" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-black text-slate-950 dark:text-white">{pkg.name}</h2>
            {pkg.isRecommended ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                {labels.recommended}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#3B82F6]">
            {durationLabel(pkg.durationMonths)}
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

      <div className="mt-5">
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{labels.packagePrice}</p>
          <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">{currency(pkg.price)}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {labels.oneTimePurchase}
          </p>
        </div>
      </div>

      {pkg.description ? (
        <div className="mt-5 min-h-[100px] rounded-2xl border border-slate-100 p-4 dark:border-white/10">
          <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{labels.description}</p>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{pkg.description}</p>
        </div>
      ) : (
        <div className="mt-5 min-h-[100px] flex items-center justify-center rounded-2xl border border-dashed border-slate-200 p-4 dark:border-white/10">
          <p className="text-xs text-slate-400 dark:text-slate-500">No description provided</p>
        </div>
      )}

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-white/10">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
        >
          <Edit3 className="h-4 w-4" />
          {labels.edit}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#EE7C11]/10 px-3 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:bg-[#EE7C11]/10 dark:text-red-300 dark:hover:bg-[#EE7C11]/20"
        >
          <Trash2 className="h-4 w-4" />
          {labels.delete}
        </button>
      </div>
    </article>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactElement;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pioneer-orange-normal/10 text-pioneer-orange-normal">
          {icon}
        </div>
      </div>
    </div>
  );
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactElement;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-4 flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pioneer-orange-normal/10 text-pioneer-orange-normal">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-950 dark:text-white">{title}</h4>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
      {label}
      {children}
    </label>
  );
}

function ToggleCard({
  checked,
  onChange,
  title,
  description,
  icon,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
  icon: ReactElement;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-start transition ${
        checked
          ? "border-pioneer-orange-normal bg-pioneer-orange-normal/5 ring-4 ring-pioneer-orange-normal/10"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03]"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          checked ? "bg-pioneer-orange-normal text-white" : "bg-slate-100 text-slate-500 dark:bg-white/10"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-black text-slate-950 dark:text-white">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</span>
      </span>
      <span
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          checked ? "border-pioneer-orange-normal bg-pioneer-orange-normal text-white" : "border-slate-300 dark:border-white/20"
        }`}
      >
        {checked ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
    </button>
  );
}

function PackageSkeleton() {
  return (
    <div className="h-[350px] animate-pulse rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#1A1A22]">
      <div className="h-6 w-1/2 rounded bg-slate-100 dark:bg-white/10" />
      <div className="mt-3 h-4 w-1/3 rounded bg-slate-100 dark:bg-white/10" />
      <div className="mt-6 h-24 rounded-2xl bg-slate-100 dark:bg-white/10" />
      <div className="mt-5 h-20 rounded-2xl bg-slate-100 dark:bg-white/10" />
      <div className="mt-5 flex justify-end gap-2">
        <div className="h-10 w-20 rounded-xl bg-slate-100 dark:bg-white/10" />
        <div className="h-10 w-20 rounded-xl bg-slate-100 dark:bg-white/10" />
      </div>
    </div>
  );
}

const inputClass =
  "h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pioneer-orange-normal focus:ring-4 focus:ring-pioneer-orange-normal/10 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white";

const textareaClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pioneer-orange-normal focus:ring-4 focus:ring-pioneer-orange-normal/10 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white";

function EmptyState({ onCreate, title, body, action }: { onCreate: () => void; title: string; body: string; action: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-white/15 dark:bg-[#1A1A22]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pioneer-orange-normal/10 text-pioneer-orange-normal">
        <Layers3 className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {body}
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 text-sm font-black text-white transition hover:bg-pioneer-orange-hover"
      >
        <Plus className="h-4 w-4" />
        {action}
      </button>
    </div>
  );
}

export default function AdminPackagesPage() {
  const { t } = useTranslation();
  const { data: packages = [], isLoading } = useAdminPackages();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPackage | null>(null);

  const { data: pkgDetail } = useAdminPackage(editingId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [durationMonths, setDurationMonths] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [isRecommended, setIsRecommended] = useState(false);

  const createMutation = useCreateAdminPackage();
  const updateMutation = useUpdateAdminPackage();
  const deleteMutation = useDeleteAdminPackage();

  useEffect(() => {
    if (!panelOpen) return;
    if (!editingId) {
      setName("");
      setDescription("");
      setPackagePrice("");
      setDurationMonths("1");
      setIsActive(true);
      setIsRecommended(false);
      return;
    }
    const p = pkgDetail;
    if (!p) return;
    setName(p.name ?? "");
    setDescription(p.description ?? "");
    setPackagePrice(String(p.price ?? ""));
    setDurationMonths(String(p.durationMonths ?? 1));
    setIsActive(p.isActive !== false);
    setIsRecommended(p.isRecommended === true);
  }, [panelOpen, editingId, pkgDetail]);

  const handleSubmit = async () => {
    const price = Number(packagePrice);
    const duration = Number(durationMonths);
    if (!name.trim() || Number.isNaN(price) || price <= 0 || Number.isNaN(duration) || duration <= 0) {
      toast.error(t("dashboard.common.validation", { defaultValue: "Check values, name, and duration." }));
      return;
    }
    const body = {
      name: name.trim(),
      description: description.trim(),
      price,
      durationMonths: duration,
      isActive,
      isRecommended,
    };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, body });
        toast.success(t("dashboard.common.saved", { defaultValue: "Saved" }));
      } else {
        await createMutation.mutateAsync(body);
        toast.success(t("dashboard.common.saved", { defaultValue: "Created" }));
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
      toast.success(t("dashboard.common.saved", { defaultValue: "Deleted" }));
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
    const recommendedCount = packages.filter((pkg) => pkg.isRecommended).length;
    const lowestPrice = packages.length
      ? Math.min(...packages.map((pkg) => Number(pkg.price ?? 0)).filter((price) => price > 0))
      : 0;

    return {
      total: packages.length,
      active: activeCount,
      recommended: recommendedCount,
      lowestPrice: Number.isFinite(lowestPrice) ? lowestPrice : 0,
    };
  }, [packages]);

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("adminPages.packages.title")}
        subtitle={t("adminPages.packages.subtitle")}
        action={
          <button
            type="button"
            onClick={openCreatePanel}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 text-sm font-black text-white shadow-lg shadow-pioneer-orange-normal/20 transition hover:-translate-y-0.5 hover:bg-pioneer-orange-hover sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {t("adminPages.packages.addPackage")}
          </button>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Layers3 className="h-5 w-5" />}
          label={t("adminPages.packages.stats.total")}
          value={stats.total}
          hint={t("adminPages.packages.stats.totalHint")}
        />
        <StatCard
          icon={<Check className="h-5 w-5" />}
          label={t("adminPages.packages.stats.active")}
          value={stats.active}
          hint={t("adminPages.packages.stats.activeHint")}
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label={t("adminPages.packages.stats.featured")}
          value={stats.recommended}
          hint={t("adminPages.packages.stats.featuredHint")}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label={t("adminPages.packages.stats.startsFrom")}
          value={currency(stats.lowestPrice)}
          hint={t("adminPages.packages.stats.startsFromHint")}
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
              onEdit={() => {
                setEditingId(pkg.id);
                setPanelOpen(true);
              }}
              onDelete={() => setDeleteTarget(pkg)}
            />
          ))}
        </div>
      )}

      <SlideOver
        open={panelOpen}
        title={editingId ? t("adminPages.packages.editPackage") : t("adminPages.packages.addPackage")}
        className="max-w-2xl p-0"
        onClose={() => {
          setPanelOpen(false);
          setEditingId(null);
        }}
      >
        <div className="flex min-h-full flex-col">
          <div className="space-y-5 p-5">
            <div className="rounded-3xl bg-gradient-to-br from-pioneer-orange-normal to-[#1E293B] p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                {editingId ? t("adminPages.packages.formHero.update") : t("adminPages.packages.formHero.create")}
              </p>
              <h3 className="mt-2 text-2xl font-black">{name.trim() || t("adminPages.packages.formHero.newPackage")}</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
                {t("adminPages.packages.formHero.description")}
              </p>
            </div>

            <FormSection
              icon={<BookOpenCheck className="h-5 w-5" />}
              title={t("adminPages.packages.sections.identity.title")}
              description={t("adminPages.packages.sections.identity.description")}
            >
              <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
                <FieldLabel label={t("adminPages.packages.form.name")}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Professional"
                    className={inputClass}
                  />
                </FieldLabel>
                <FieldLabel label={t("adminPages.packages.form.durationMonths", { defaultValue: "Duration (Months)" })}>
                  <input
                    type="number"
                    min={1}
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    placeholder="e.g., 6"
                    className={inputClass}
                  />
                </FieldLabel>
              </div>
            </FormSection>

            <FormSection
              icon={<DollarSign className="h-5 w-5" />}
              title={t("adminPages.packages.sections.pricing.title")}
              description={t("adminPages.packages.sections.pricing.description")}
            >
              <div className="grid gap-3">
                <FieldLabel label={t("adminPages.packages.form.priceMonthly")}>
                  <input
                    type="number"
                    min={0.01}
                    step="0.01"
                    value={packagePrice}
                    onChange={(e) => setPackagePrice(e.target.value)}
                    className={inputClass}
                  />
                </FieldLabel>
              </div>
              <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
                {t("adminPages.packages.form.priceHint")}
              </div>
            </FormSection>

            <FormSection
              icon={<Sparkles className="h-5 w-5" />}
              title={t("adminPages.packages.sections.description.title", { defaultValue: "Description" })}
              description={t("adminPages.packages.sections.description.description", { defaultValue: "Add details about the plan" })}
            >
              <FieldLabel label={t("adminPages.packages.form.description", { defaultValue: "Plan Description" })}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder={t("adminPages.packages.form.descriptionPlaceholder", { defaultValue: "Write details here..." })}
                  className={textareaClass}
                />
              </FieldLabel>
            </FormSection>

            <FormSection
              icon={<Eye className="h-5 w-5" />}
              title={t("adminPages.packages.sections.visibility.title")}
              description={t("adminPages.packages.sections.visibility.description")}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleCard
                  checked={isRecommended}
                  onChange={setIsRecommended}
                  title={t("adminPages.packages.form.recommended", { defaultValue: "Recommended" })}
                  description={t("adminPages.packages.form.recommendedDescription", { defaultValue: "Highlight this package on the dashboard" })}
                  icon={<Sparkles className="h-4 w-4" />}
                />
                <ToggleCard
                  checked={isActive}
                  onChange={setIsActive}
                  title={t("adminPages.packages.form.active")}
                  description={t("adminPages.packages.form.activeDescription")}
                  icon={<Eye className="h-4 w-4" />}
                />
              </div>
            </FormSection>
          </div>

          <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white/95 p-5 backdrop-blur dark:border-white/10 dark:bg-[#1A1A22]/95">
            <button
              type="button"
              onClick={() => {
                setPanelOpen(false);
                setEditingId(null);
              }}
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              {t("adminPages.packages.form.cancel")}
            </button>
            <button
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => void handleSubmit()}
              className="h-11 rounded-xl bg-pioneer-orange-normal px-5 text-sm font-black text-white shadow-lg shadow-pioneer-orange-normal/20 transition hover:bg-pioneer-orange-hover disabled:opacity-50"
            >
              {t("adminPages.packages.form.save")}
            </button>
          </div>
        </div>
      </SlideOver>

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

