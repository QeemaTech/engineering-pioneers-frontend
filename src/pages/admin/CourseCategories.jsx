import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
} from "../../features/admin/categories/hooks";
import { getErrorMessage } from "../../api/error";

function CourseCategories() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const { data, isLoading, isError, error, refetch } = useAdminCategories({ page: 1, limit: 50 });
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();
  const categories = data?.categories || [];

  const onSave = () => {
    if (!name || !slug) return;
    const body = { name, slug, description: description || undefined };
    if (editingId) {
      updateMutation.mutate({ id: editingId, body });
      return;
    }
    createMutation.mutate(body);
  };

  return (
    <section className="space-y-6">
      <PageHeader title={t("adminPages.categories.title")} subtitle={t("adminPages.categories.subtitle")} />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 dark:border-white/8 dark:bg-[#1A1A22]">
          <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" placeholder={t("adminPages.categories.nameEn")} />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" placeholder="slug" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" placeholder={t("adminPages.categories.icon")} />
          <button onClick={onSave} className="rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white">{editingId ? "Update" : t("adminPages.categories.save")}</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
          {isLoading ? <div className="text-sm text-slate-500">Loading categories...</div> : null}
          {isError ? <div className="text-sm text-red-500">{getErrorMessage(error, "Failed to load categories.")} <button onClick={() => refetch()} className="underline">Retry</button></div> : null}
          {categories.map((c) => (
            <div key={c.id} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="mb-2 text-2xl">#</div>
              <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
              <p className="text-xs text-slate-500">{c.slug}</p>
              <div className="mt-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => { setEditingId(c.id); setName(c.name || ""); setSlug(c.slug || ""); setDescription(c.description || ""); }} className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-white/10"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteMutation.mutate(c.id)} className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-white/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CourseCategories;

