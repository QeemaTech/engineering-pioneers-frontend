import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import PageHeader from "../../components/ui/PageHeader";
import SlideOver from "../../components/ui/SlideOver";
import { useAdminBanners, useCreateBanner, useDeleteBanner, useUpdateBanner } from "../../features/admin/cms/hooks";
import { getErrorMessage } from "../../api/error";
import ImageUploader from "../../components/ui/ImageUploader";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const emptyForm = { title: "", link: "", imageUrl: "", order: "0", isActive: true };

function BannerPreview({ banners }) {
  const active = (banners || []).filter((b) => b.isActive).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const [index, setIndex] = useState(0);
  const current = active[index];

  if (!active.length) {
    return (
      <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
        <ImageIcon className="me-2 h-4 w-4" />
        No active slides to preview
      </div>
    );
  }

  const prev = () => setIndex((i) => (i === 0 ? active.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === active.length - 1 ? 0 : i + 1));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm dark:border-white/10">
        <img src={resolveMediaUrl(current.imageUrl)} alt={current.title || "Banner"} className="h-44 w-full object-cover md:h-56" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 start-0 end-0 p-4 text-white">
        <p className="text-xs uppercase tracking-wider text-white/70">Mobile slider preview</p>
        <p className="mt-1 text-lg font-bold">{current.title || "Untitled slide"}</p>
        {current.link ? <p className="mt-1 truncate text-xs text-white/80">{current.link}</p> : null}
      </div>
      {active.length > 1 ? (
        <>
          <button type="button" onClick={prev} className="absolute start-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={next} className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 end-4 flex gap-1.5">
            {active.map((b, i) => (
              <span key={b.id} className={`h-1.5 rounded-full ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CmsBanners() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useAdminBanners();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();
  const rows = data || [];

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [rows]
  );

  const openCreate = () => {
    const nextOrder =
      sortedRows.length > 0 ? Math.max(...sortedRows.map((b) => Number(b.order) || 0)) + 1 : 0;
    setEditingId(null);
    setForm({ ...emptyForm, order: String(nextOrder) });
    setPanelOpen(true);
  };

  const openEdit = (banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title || "",
      link: banner.link || "",
      imageUrl: banner.imageUrl || "",
      order: String(banner.order ?? 0),
      isActive: Boolean(banner.isActive),
    });
    setPanelOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.imageUrl.trim()) {
      toast.error(t("dashboard.common.validation", { defaultValue: "Image URL is required." }));
      return;
    }

    const body = {
      title: form.title.trim() || undefined,
      imageUrl: form.imageUrl.trim(),
      link: form.link.trim() || undefined,
      isActive: form.isActive,
      order: Number(form.order) || 0,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, body });
        toast.success(t("adminPages.cmsBanners.updated", { defaultValue: "Banner updated." }));
      } else {
        await createMutation.mutateAsync(body);
        toast.success(t("adminPages.cmsBanners.created", { defaultValue: "Banner created." }));
      }
      setPanelOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save banner."));
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("adminPages.cmsBanners.title")}
        subtitle={t("adminPages.cmsBanners.subtitle")}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            {t("adminPages.cmsBanners.add")}
          </button>
        }
      />

      <BannerPreview banners={rows} />

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
        {t("adminPages.cmsBanners.mobileHint", {
          defaultValue: "Active banners appear on the mobile home slider via GET /public/banners.",
        })}
      </div>

      {isLoading ? <p className="text-sm text-slate-500">{t("adminPages.cmsBanners.loading")}</p> : null}
      {isError ? (
        <p className="text-sm text-red-500">
          {getErrorMessage(error, "Failed to load.")}{" "}
          <button type="button" onClick={() => refetch()} className="underline">
            Retry
          </button>
        </p>
      ) : null}

      {!isLoading && !sortedRows.length ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center dark:border-white/10 dark:bg-white/5">
          <ImageIcon className="h-10 w-10 text-slate-400" />
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-200">{t("adminPages.cmsBanners.empty")}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("adminPages.cmsBanners.emptyHint", {
                defaultValue: "Add multiple slides for the mobile home banner carousel.",
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            {t("adminPages.cmsBanners.add")}
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedRows.map((banner) => (
          <article
            key={banner.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#1A1A22]"
          >
            <div className="relative h-36 bg-slate-100 dark:bg-white/5">
              {banner.imageUrl ? (
                <img src={resolveMediaUrl(banner.imageUrl)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <span
                className={`absolute start-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  banner.isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                    : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                }`}
              >
                {banner.isActive ? t("adminPages.cmsBanners.active", { defaultValue: "Active" }) : t("adminPages.cmsBanners.inactive", { defaultValue: "Inactive" })}
              </span>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{banner.title || t("adminPages.cmsBanners.untitled", { defaultValue: "Untitled" })}</p>
                {banner.link ? (
                  <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {banner.link}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">{t("adminPages.cmsBanners.noLink", { defaultValue: "No link" })}</p>
                )}
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {t("adminPages.cmsBanners.order")}: {banner.order ?? 0}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(banner)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
                >
                  <Pencil className="h-3 w-3" />
                  {t("dashboard.common.edit", { defaultValue: "Edit" })}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateMutation.mutate({
                      id: banner.id,
                      body: { isActive: !banner.isActive },
                    })
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
                >
                  {t("adminPages.cmsBanners.toggle")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(t("adminPages.cmsBanners.confirmDelete"))) return;
                    deleteMutation.mutate(banner.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 dark:border-red-500/40 dark:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                  {t("adminPages.cmsBanners.delete")}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editingId ? t("adminPages.cmsBanners.edit", { defaultValue: "Edit banner" }) : t("adminPages.cmsBanners.add")}
      >
        <form onSubmit={submitForm} className="space-y-4">
          <label className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("adminPages.cmsBanners.form.title")}
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("adminPages.cmsBanners.imageUrl")}
            <span className="text-red-500"> *</span>
          </label>
          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url || "" }))}
            required
            allowRemove={false}
            allowExternalUrl
          />
          <label className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("adminPages.cmsBanners.form.link")}
            <input
              value={form.link}
              onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
              placeholder="/courses or https://..."
              className="h-11 w-full rounded-lg border border-slate-200 px-3 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("adminPages.cmsBanners.order")}
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            {t("adminPages.cmsBanners.showOnMobile", { defaultValue: "Show on mobile slider" })}
          </label>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="w-full rounded-lg bg-[#EE7C11] py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {editingId
              ? t("adminPages.cmsBanners.save", { defaultValue: "Save changes" })
              : t("adminPages.cmsBanners.create")}
          </button>
        </form>
      </SlideOver>
    </section>
  );
}

export default CmsBanners;
