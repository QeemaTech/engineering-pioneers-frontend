import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import DataTable from "../../components/ui/DataTable";
import PageHeader from "../../components/ui/PageHeader";
import SlideOver from "../../components/ui/SlideOver";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { getErrorMessage } from "../../api/error";
import { useAdminCourses } from "../../features/admin/courses/hooks";
import { useAdminInstructors } from "../../features/admin/instructors/hooks";
import {
  useAdminCohort,
  useAdminCohorts,
  useCreateAdminCohort,
  useDeleteAdminCohort,
  useUpdateAdminCohort,
} from "../../features/admin/cohorts/hooks";
import type { AdminCohortListItem, CohortStatus, CohortType } from "../../features/admin/cohorts/types";

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(local: string): string {
  return new Date(local).toISOString();
}

const defaultLimit = 10;

export default function AdminCohortsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [courseFilter, setCourseFilter] = useState("");
  const [instructorFilter, setInstructorFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | CohortType>("");

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCohortListItem | null>(null);

  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [type, setType] = useState<CohortType>("LIVE");
  const [status, setStatus] = useState<CohortStatus>("UPCOMING");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [price, setPrice] = useState("0");

  const listParams = useMemo(
    () => ({
      page,
      limit: defaultLimit,
      courseId: courseFilter || undefined,
      instructorId: instructorFilter || undefined,
      type: typeFilter || undefined,
    }),
    [page, courseFilter, instructorFilter, typeFilter]
  );

  const { data, isLoading, isFetching } = useAdminCohorts(listParams);
  const { data: cohortDetail } = useAdminCohort(editingId);
  const { data: coursesPayload } = useAdminCourses({ page: 1, limit: 200 });
  const { data: instructorsPayload } = useAdminInstructors({ page: 1, limit: 200 });

  const courses = coursesPayload?.courses ?? [];
  const instructors = instructorsPayload?.instructors ?? [];

  const createMutation = useCreateAdminCohort();
  const updateMutation = useUpdateAdminCohort();
  const deleteMutation = useDeleteAdminCohort();

  useEffect(() => {
    if (!panelOpen) return;
    if (!editingId) {
      setName("");
      setCourseId(courseFilter || "");
      setInstructorId(instructorFilter || "");
      setType("LIVE");
      setStatus("UPCOMING");
      setStartLocal("");
      setEndLocal("");
      setPrice("0");
      return;
    }
    const c = cohortDetail;
    if (!c) return;
    setName(c.name ?? "");
    setCourseId(c.courseId ?? "");
    setInstructorId(c.instructorId ?? "");
    setType((c.type as CohortType) || "LIVE");
    setStatus((c.status as CohortStatus) || "UPCOMING");
    setStartLocal(toDatetimeLocalValue(c.startDate));
    setEndLocal(toDatetimeLocalValue(c.endDate));
    setPrice(String(c.price ?? 0));
  }, [panelOpen, editingId, cohortDetail, courseFilter, instructorFilter]);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? defaultLimit)));

  const openCreate = () => {
    setEditingId(null);
    setPanelOpen(true);
  };

  const openEdit = (row: AdminCohortListItem) => {
    setEditingId(row.id);
    setPanelOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !courseId || !instructorId || !startLocal) {
      toast.error(t("dashboard.common.validation", { defaultValue: "Please fill required fields." }));
      return;
    }
    const startDate = fromDatetimeLocal(startLocal);
    const endDate = endLocal ? fromDatetimeLocal(endLocal) : undefined;
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      toast.error(t("dashboard.common.validation", { defaultValue: "Invalid price." }));
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          body: {
            name: name.trim(),
            courseId,
            instructorId,
            type,
            status,
            startDate,
            endDate: endDate ?? null,
            price: priceNum,
          },
        });
        toast.success(t("dashboard.common.saved", { defaultValue: "Saved" }));
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          courseId,
          instructorId,
          type,
          status,
          startDate,
          endDate: endDate ?? undefined,
          price: priceNum,
        });
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

  const rows = data?.classes ?? [];

  return (
    <section className="space-y-6">
      <PageHeader title={t("adminPages.cohorts.title")} subtitle={t("adminPages.cohorts.subtitle")} />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#1A1A22] lg:flex-row lg:flex-wrap lg:items-end">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("adminPages.cohorts.filters.course")}
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            >
              <option value="">{t("adminPages.cohorts.filters.allCourses")}</option>
              {courses.map((c: { id: string; title?: string }) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.id}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("adminPages.cohorts.filters.instructor")}
            <select
              value={instructorFilter}
              onChange={(e) => {
                setInstructorFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            >
              <option value="">{t("adminPages.cohorts.filters.allInstructors")}</option>
              {instructors.map((u: { id: string; fullName?: string }) => (
                <option key={u.id} value={u.id}>
                  {u.fullName || u.id}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("adminPages.cohorts.filters.type")}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as "" | CohortType);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            >
              <option value="">{t("adminPages.cohorts.filters.allTypes")}</option>
              <option value="LIVE">LIVE</option>
              <option value="RECORDED">RECORDED</option>
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-10 shrink-0 rounded-lg bg-pioneer-orange-normal px-4 text-sm font-bold text-white hover:bg-pioneer-orange-hover"
        >
          {t("adminPages.cohorts.addCohort")}
        </button>
      </div>

      <DataTable
        columns={[
          { key: "name", title: t("adminPages.cohorts.table.name") },
          {
            key: "course",
            title: t("adminPages.cohorts.table.course"),
            render: (_: unknown, row: AdminCohortListItem) => row.course?.title ?? "—",
          },
          {
            key: "instructor",
            title: t("adminPages.cohorts.table.instructor"),
            render: (_: unknown, row: AdminCohortListItem) => row.instructor?.fullName ?? "—",
          },
          { key: "type", title: t("adminPages.cohorts.table.type") },
          { key: "status", title: t("adminPages.cohorts.table.status") },
          {
            key: "startDate",
            title: t("adminPages.cohorts.table.start"),
            render: (v: unknown) => (v ? String(new Date(String(v)).toLocaleString()) : "—"),
          },
          {
            key: "price",
            title: t("adminPages.cohorts.table.price"),
            render: (v: unknown) => `$${Number(v ?? 0).toFixed(2)}`,
          },
          {
            key: "id",
            title: t("adminPages.cohorts.table.actions"),
            render: (_: unknown, row: AdminCohortListItem) => (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="text-xs font-semibold text-pioneer-orange-normal hover:underline"
                >
                  {t("adminPages.cohorts.table.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  {t("adminPages.cohorts.table.delete")}
                </button>
              </div>
            ),
          },
        ]}
        rows={rows}
        pagination={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("adminPages.cohorts.page", { page, totalPages })}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40 dark:border-white/10"
              >
                {t("adminPages.cohorts.prev")}
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40 dark:border-white/10"
              >
                {t("adminPages.cohorts.next")}
              </button>
            </div>
          </div>
        }
      />

      {!isLoading && rows.length === 0 ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">{t("adminPages.cohorts.empty")}</p>
      ) : null}
      {isFetching ? (
        <p className="text-center text-xs text-slate-400">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</p>
      ) : null}

      <SlideOver
        open={panelOpen}
        title={editingId ? t("adminPages.cohorts.editCohort") : t("adminPages.cohorts.addCohort")}
        onClose={() => {
          setPanelOpen(false);
          setEditingId(null);
        }}
      >
        <div className="space-y-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("adminPages.cohorts.form.name")}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("adminPages.cohorts.form.course")}
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            >
              <option value="">—</option>
              {courses.map((c: { id: string; title?: string }) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.id}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("adminPages.cohorts.form.instructor")}
            <select
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            >
              <option value="">—</option>
              {instructors.map((u: { id: string; fullName?: string }) => (
                <option key={u.id} value={u.id}>
                  {u.fullName || u.id}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t("adminPages.cohorts.filters.type")}
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CohortType)}
                className="h-10 rounded-lg border border-slate-200 px-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              >
                <option value="LIVE">{t("adminPages.cohorts.form.typeLive")}</option>
                <option value="RECORDED">{t("adminPages.cohorts.form.typeRecorded")}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t("adminPages.cohorts.form.status")}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CohortStatus)}
                className="h-10 rounded-lg border border-slate-200 px-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("adminPages.cohorts.form.start")}
            <input
              type="datetime-local"
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("adminPages.cohorts.form.end")}
            <input
              type="datetime-local"
              value={endLocal}
              onChange={(e) => setEndLocal(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("adminPages.cohorts.form.price")}
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setPanelOpen(false);
                setEditingId(null);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10"
            >
              {t("adminPages.cohorts.form.cancel")}
            </button>
            <button
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => void handleSubmit()}
              className="rounded-lg bg-pioneer-orange-normal px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {t("adminPages.cohorts.form.save")}
            </button>
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("adminPages.cohorts.deleteConfirmTitle")}
        message={t("adminPages.cohorts.deleteConfirmMessage")}
        confirmLabel={t("adminPages.cohorts.deleteConfirm")}
        cancelLabel={t("adminPages.cohorts.deleteCancel")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
