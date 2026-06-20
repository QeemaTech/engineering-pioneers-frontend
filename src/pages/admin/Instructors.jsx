import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, Pencil, Plus, Search, Trash2, UserRoundCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import DataTable from "../../components/dashboard/DataTable";
import EmptyState from "../../components/dashboard/EmptyState";
import PageHeader from "../../components/dashboard/PageHeader";
import {
  useAdminInstructors,
  useCreateInstructor,
  useDeleteInstructor,
  useUpdateInstructor,
} from "../../features/admin/instructors/hooks";
import { useSetAdminUserPassword as useSetAnyUserPassword } from "../../features/admin/users/hooks";
import { getErrorMessage } from "../../api/error";

const instructorSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  experience: z.coerce.number().int().min(0).optional(),
  password: z.string().min(8).optional(),
});

function Instructors() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeForm, setActiveForm] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const { data, isLoading } = useAdminInstructors({ search, page: 1, limit: 20 });
  const createMutation = useCreateInstructor();
  const updateMutation = useUpdateInstructor();
  const deleteMutation = useDeleteInstructor();
  const setPasswordMutation = useSetAnyUserPassword();

  const form = useForm({
    resolver: zodResolver(instructorSchema),
    defaultValues: { fullName: "", email: "", phone: "", bio: "", experience: 0, password: "" },
  });

  const openCreate = () => {
    form.reset({ fullName: "", email: "", phone: "", bio: "", experience: 0, password: "" });
    setActiveForm({ mode: "create", item: null });
  };

  const openEdit = (item) => {
    form.reset({
      fullName: item.fullName || "",
      email: item.email || "",
      phone: item.phone || "",
      bio: item.bio || "",
      experience: item.experience ?? 0,
      password: "",
    });
    setActiveForm({ mode: "edit", item });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (activeForm?.mode === "create") {
        await createMutation.mutateAsync({ ...values, password: values.password || "ChangeMe123!" });
        toast.success("Instructor created successfully.");
      } else {
        const payload = { ...values };
        delete payload.password;
        await updateMutation.mutateAsync({ id: activeForm.item.id, body: payload });
        toast.success("Instructor profile updated successfully.");
      }
      setActiveForm(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save instructor."));
    }
  });

  const handleChangePassword = async () => {
    if (!activeForm?.item?.id || !newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setChangingPassword(true);
    try {
      await setPasswordMutation.mutateAsync({ id: activeForm.item.id, newPassword });
      toast.success("Password updated successfully.");
      setNewPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update password."));
    } finally {
      setChangingPassword(false);
    }
  };

  const columns = useMemo(
    () => [
      { key: "fullName", title: t("dashboard.admin.users.name") },
      { key: "email", title: t("dashboard.admin.users.email") },
      { key: "phone", title: t("dashboard.admin.instructors.phone") },
      { key: "experience", title: t("dashboard.admin.instructors.experience") },
      {
        key: "isActive",
        title: t("dashboard.admin.users.status"),
        render: (value) => (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            value ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border border-white/5"
          }`}>
            <span className={`me-1.5 h-1.5 w-1.5 rounded-full ${value ? "bg-emerald-500" : "bg-slate-500"}`} />
            {value ? t("dashboard.common.active") : t("dashboard.common.inactive")}
          </span>
        ),
      },
      {
        key: "id",
        title: t("dashboard.common.actions"),
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <button 
              onClick={() =>
                updateMutation.mutate(
                  { id: row.id, body: { isActive: !row.isActive } },
                  {
                    onSuccess: () => toast.success("Instructor status updated."),
                    onError: (err) => toast.error(getErrorMessage(err, "Failed to update status.")),
                  }
                )
              }
              className="rounded-lg border border-white/5 bg-white/5 p-2 text-slate-400 transition-all hover:bg-[#EE7C11] hover:text-white"
            >
              <UserRoundCheck className="h-4 w-4" />
            </button>
            <button 
              onClick={() => openEdit(row)} 
              className="rounded-lg border border-white/5 bg-white/5 p-2 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button 
              onClick={() =>
                deleteMutation.mutate(row.id, {
                  onSuccess: () => toast.success("Instructor deleted."),
                  onError: (err) => toast.error(getErrorMessage(err, "Failed to delete instructor.")),
                })
              }
              className="rounded-lg border border-red-900/20 bg-red-950/10 p-2 text-red-500 transition-all hover:bg-red-600 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [t, updateMutation, deleteMutation]
  );

  return (
    <section>
      <PageHeader
        title={t("dashboard.admin.pages.instructors.title")}
        subtitle={t("dashboard.admin.pages.instructors.subtitle")}
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("dashboard.common.search")}
                className="h-10 w-64 rounded-lg border border-slate-200 bg-white ps-9 pe-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-1 focus:ring-[#0D9488]/30 dark:border-white/10 dark:bg-[#1A1A22] dark:text-white dark:placeholder:text-slate-600 dark:focus:border-[#EE7C11] dark:focus:ring-[#0D9488]/30"
              />
            </div>
            <button onClick={openCreate} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#EE7C11] px-5 text-sm font-bold text-white shadow-xl shadow-[#EE7C11]/20 transition-all hover:bg-[#d9700e] active:scale-95">
              <Plus className="h-4 w-4" /> {t("dashboard.admin.instructors.add")}
            </button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.instructors || []}
        emptyNode={
          <EmptyState
            title={isLoading ? t("dashboard.common.loading") : t("dashboard.admin.instructors.emptyTitle")}
            message={t("dashboard.admin.instructors.emptyDescription")}
          />
        }
      />

      {activeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F0F13]/80 p-4 backdrop-blur-md">
          <form onSubmit={onSubmit} className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-[#1A1A22]">
            <h3 className="mb-6 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {activeForm.mode === "create" ? t("dashboard.admin.instructors.add") : t("dashboard.admin.instructors.edit")}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {["fullName", "email", "phone", "experience"].map((field) => (
                <div key={field} className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">
                    {t(`dashboard.admin.instructors.${field}`)}
                  </label>
                  <input 
                    {...form.register(field)} 
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#EE7C11] focus:ring-1 focus:ring-[#0D9488]/30 dark:border-white/10 dark:bg-[#1A1A22] dark:text-white dark:focus:border-[#EE7C11] dark:focus:ring-[#0D9488]/30"
                  />
                </div>
              ))}
              {activeForm.mode === "create" && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    {t("dashboard.admin.instructors.password")}
                  </label>
                  <input 
                    {...form.register("password")} 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#EE7C11] focus:ring-1 focus:ring-[#0D9488]/30 dark:border-white/10 dark:bg-[#1A1A22] dark:text-white dark:focus:border-[#EE7C11] dark:focus:ring-[#0D9488]/30"
                  />
                </div>
              )}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  {t("dashboard.admin.instructors.bio")}
                </label>
                <textarea 
                  {...form.register("bio")} 
                  className="min-h-24 w-full rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#EE7C11] focus:ring-1 focus:ring-[#0D9488]/30 dark:border-white/10 dark:bg-[#1A1A22] dark:text-white dark:focus:border-[#EE7C11] dark:focus:ring-[#0D9488]/30"
                />
              </div>
            </div>
            {activeForm.mode === "edit" ? (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                <div className="mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Security Warning</span>
                </div>
                <p className="mb-3 text-xs text-amber-700/90 dark:text-amber-200">
                  Changing this password will sign the instructor out from existing sessions. Use a strong temporary password and share it securely.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 chars)"
                    className="h-11 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#EE7C11] focus:ring-1 focus:ring-[#0D9488]/30 dark:border-white/10 dark:bg-[#1A1A22] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={changingPassword || setPasswordMutation.isPending}
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-amber-300 bg-amber-100 px-4 text-sm font-bold text-amber-800 transition hover:bg-amber-200 disabled:opacity-70 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200"
                  >
                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Password"}
                  </button>
                </div>
              </div>
            ) : null}
            <div className="mt-8 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => {
                  setActiveForm(null);
                  setNewPassword("");
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                {t("dashboard.common.cancel")}
              </button>
              <button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending} 
                className="inline-flex items-center gap-2 rounded-lg bg-[#EE7C11] px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-[#EE7C11]/20 transition-all hover:bg-[#d9700e] active:scale-95"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("dashboard.common.save")}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}


export default Instructors;
