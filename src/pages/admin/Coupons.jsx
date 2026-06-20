import { useMemo, useState } from "react";
import { Edit2, Plus, RefreshCcw, Search, Tag, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import PageHeader from "../../components/ui/PageHeader";
import {
  useAdminCoupons,
  useCreateAdminCoupon,
  useDeleteAdminCoupon,
  useUpdateAdminCoupon,
} from "../../features/admin/coupons/hooks";
import { useAdminCourses } from "../../features/admin/courses/hooks";
import { getErrorMessage } from "../../api/error";

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  appliesTo: "BOTH",
  maxUses: "",
  maxUsesPerUser: 1,
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

function Coupons() {
  const { t } = useTranslation();
  const tx = (key, fallback) => t(key, { defaultValue: fallback });
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminCoupons({ page: 1, limit: 100 });
  const { data: coursesData } = useAdminCourses({ page: 1, limit: 200 });
  const createCoupon = useCreateAdminCoupon();
  const updateCoupon = useUpdateAdminCoupon();
  const deleteCoupon = useDeleteAdminCoupon();

  const coupons = data?.coupons || [];
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return coupons;
    return coupons.filter((coupon) => {
      return (
        String(coupon.code || "").toLowerCase().includes(term) ||
        String(coupon.description || "").toLowerCase().includes(term)
      );
    });
  }, [coupons, search]);

  const onDelete = async (id) => {
    if (!window.confirm(tx("adminPages.coupons.confirmDelete", "Delete this coupon?"))) return;
    try {
      await deleteCoupon.mutateAsync(id);
      toast.success(tx("adminPages.coupons.deleteSuccess", "Coupon deleted"));
    } catch (err) {
      toast.error(getErrorMessage(err, tx("adminPages.coupons.deleteError", "Failed to delete coupon")));
    }
  };

  const onToggleStatus = async (coupon) => {
    try {
      await updateCoupon.mutateAsync({ id: coupon.id, body: { isActive: !coupon.isActive } });
      toast.success(tx("adminPages.coupons.updateSuccess", "Coupon updated"));
    } catch (err) {
      toast.error(getErrorMessage(err, tx("adminPages.coupons.updateError", "Failed to update coupon")));
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={tx("adminPages.coupons.title", "Coupons")}
        subtitle={tx("adminPages.coupons.subtitle", "Create, manage, and activate discount coupons")}
        action={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d9700e]"
          >
            <Plus className="h-4 w-4" />
            {tx("adminPages.coupons.new", "New Coupon")}
          </button>
        }
      />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1A1A22] sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tx("adminPages.coupons.search", "Search coupons")}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 ps-9 pe-3 text-sm text-slate-900 outline-none focus:border-[#EE7C11] focus:bg-white dark:border-white/10 dark:bg-[#0F0F13] dark:text-white dark:focus:border-[#EE7C11]"
          />
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:text-slate-900 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300 dark:hover:text-white"
          title={tx("common.refresh", "Refresh")}
        >
          <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
        {isLoading ? <p className="p-5 text-sm text-slate-500">{tx("common.loading", "Loading...")}</p> : null}
        {isError ? (
          <p className="p-5 text-sm text-red-500">
            {getErrorMessage(error, tx("adminPages.coupons.fetchError", "Failed to load coupons"))}{" "}
            <button onClick={() => refetch()} className="underline">
              {tx("common.retry", "Retry")}
            </button>
          </p>
        ) : null}
        {!isLoading && !isError ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-white/10">
              <thead className="bg-slate-50 dark:bg-[#0F0F13]">
                <tr>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-slate-500">{tx("adminPages.coupons.code", "Code")}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-slate-500">{tx("adminPages.coupons.discount", "Discount")}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-slate-500">{tx("adminPages.coupons.appliesTo", "Applies To")}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-slate-500">{tx("adminPages.coupons.validity", "Validity")}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-slate-500">{tx("common.status", "Status")}</th>
                  <th className="px-4 py-3 text-end text-xs font-bold uppercase tracking-wider text-slate-500">{tx("common.actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      <div className="inline-flex items-center gap-2">
                        <Tag className="h-4 w-4 text-[#EE7C11]" />
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `${coupon.discountValue} SAR`}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{coupon.appliesTo}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {coupon.startsAt ? new Date(coupon.startsAt).toLocaleDateString() : "-"} -{" "}
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : tx("common.none", "None")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(coupon)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          coupon.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {coupon.isActive ? tx("common.active", "Active") : tx("common.inactive", "Inactive")}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(coupon);
                            setOpenForm(true);
                          }}
                          className="rounded-md p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-500/20"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(coupon.id)}
                          className="rounded-md p-2 text-slate-500 hover:bg-[#EE7C11]/10 hover:text-red-700 dark:text-slate-300 dark:hover:bg-[#EE7C11]/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                      {tx("adminPages.coupons.empty", "No coupons found")}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {openForm ? (
        <CouponFormModal
          coupon={editing}
          courses={coursesData?.courses || []}
          loading={createCoupon.isPending || updateCoupon.isPending}
          onClose={() => setOpenForm(false)}
          onSubmit={async (payload) => {
            try {
              if (editing?.id) {
                await updateCoupon.mutateAsync({ id: editing.id, body: payload });
                toast.success(tx("adminPages.coupons.updateSuccess", "Coupon updated"));
              } else {
                await createCoupon.mutateAsync(payload);
                toast.success(tx("adminPages.coupons.createSuccess", "Coupon created"));
              }
              setOpenForm(false);
            } catch (err) {
              toast.error(getErrorMessage(err, tx("adminPages.coupons.saveError", "Failed to save coupon")));
            }
          }}
        />
      ) : null}
    </section>
  );
}

function CouponFormModal({ coupon, courses = [], loading, onClose, onSubmit }) {
  const { t } = useTranslation();
  const tx = (key, fallback) => t(key, { defaultValue: fallback });
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...coupon,
    discountValue: coupon?.discountValue ?? "",
    maxUses: coupon?.maxUses ?? "",
    startsAt: coupon?.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 10) : "",
    expiresAt: coupon?.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : "",
    courseIds: coupon?.courseIds || coupon?.eligibleCourses?.map((ec) => ec.courseId || ec.course?.id).filter(Boolean) || [],
  }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      code: String(form.code || "").trim().toUpperCase(),
      description: form.description || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      appliesTo: form.appliesTo,
      maxUses: form.maxUses === "" ? null : Number(form.maxUses),
      maxUsesPerUser: Number(form.maxUsesPerUser || 1),
      startsAt: form.startsAt ? new Date(`${form.startsAt}T00:00:00.000Z`).toISOString() : undefined,
      expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59.999Z`).toISOString() : null,
      isActive: Boolean(form.isActive),
      courseIds: Array.isArray(form.courseIds) ? form.courseIds : [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#1A1A22]">
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {coupon ? tx("adminPages.coupons.edit", "Edit Coupon") : tx("adminPages.coupons.new", "New Coupon")}
            </h3>
            <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:underline">
              {tx("common.cancel", "Cancel")}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input required minLength={3} value={form.code} onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))} placeholder={tx("adminPages.coupons.code", "Code")} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
            <select value={form.discountType} onChange={(e) => setForm((s) => ({ ...s, discountType: e.target.value }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white">
              <option value="PERCENTAGE">PERCENTAGE</option>
              <option value="FIXED">FIXED</option>
            </select>
            <input required type="number" min={1} value={form.discountValue} onChange={(e) => setForm((s) => ({ ...s, discountValue: e.target.value }))} placeholder={tx("adminPages.coupons.discount", "Discount")} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
            <select value={form.appliesTo} onChange={(e) => setForm((s) => ({ ...s, appliesTo: e.target.value }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white">
              <option value="SUBSCRIPTION">SUBSCRIPTION</option>
              <option value="CLASS">CLASS</option>
              <option value="BOTH">BOTH</option>
            </select>
            <input type="number" min={1} value={form.maxUses} onChange={(e) => setForm((s) => ({ ...s, maxUses: e.target.value }))} placeholder={tx("adminPages.coupons.maxUses", "Max uses")} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
            <input type="number" min={1} value={form.maxUsesPerUser} onChange={(e) => setForm((s) => ({ ...s, maxUsesPerUser: e.target.value }))} placeholder={tx("adminPages.coupons.maxUsesPerUser", "Max uses per user")} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
            <input type="date" value={form.startsAt} onChange={(e) => setForm((s) => ({ ...s, startsAt: e.target.value }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
            <input type="date" value={form.expiresAt} onChange={(e) => setForm((s) => ({ ...s, expiresAt: e.target.value }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
          </div>
          {form.appliesTo !== "SUBSCRIPTION" ? (
            <div className="rounded-lg border border-slate-200 p-3 dark:border-white/10">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                {tx("adminPages.coupons.targetCourses", "Target courses (optional)")}
              </p>
              <div className="max-h-40 space-y-1 overflow-auto">
                {courses.map((course) => (
                  <label key={course.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={(form.courseIds || []).includes(course.id)}
                      onChange={(e) =>
                        setForm((prev) => {
                          const list = Array.isArray(prev.courseIds) ? prev.courseIds : [];
                          return {
                            ...prev,
                            courseIds: e.target.checked
                              ? [...list, course.id]
                              : list.filter((id) => id !== course.id),
                          };
                        })
                      }
                    />
                    <span>{course.title}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <textarea value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} placeholder={tx("common.description", "Description")} className="min-h-20 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))} />
            {tx("common.active", "Active")}
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:text-slate-200">
              {tx("common.cancel", "Cancel")}
            </button>
            <button disabled={loading} type="submit" className="rounded-lg bg-[#EE7C11] px-3 py-2 text-sm font-bold text-white disabled:opacity-70">
              {loading ? tx("common.saving", "Saving...") : tx("common.save", "Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Coupons;

