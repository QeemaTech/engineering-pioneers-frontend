import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import { useAdminEmailTemplates, useCreateAdminEmailTemplate, useUpdateAdminEmailTemplate } from "../../features/admin/settings/hooks";
import { getErrorMessage } from "../../api/error";

function SettingsEmails() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useAdminEmailTemplates();
  const createMutation = useCreateAdminEmailTemplate();
  const updateMutation = useUpdateAdminEmailTemplate();
  const templates = data || [];
  const [selectedId, setSelectedId] = useState("");
  const selectedTemplate = templates.find((t) => t.id === selectedId) || templates[0];
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const save = () => {
    if (selectedTemplate?.id) {
      updateMutation.mutate({ id: selectedTemplate.id, body: { subject: subject || selectedTemplate.subject, body: body || selectedTemplate.body } });
      return;
    }
    createMutation.mutate({ name: "New Template", subject: subject || "Default subject line", body: body || "Default template body content." });
  };
  return (
    <section className="space-y-6">
      <PageHeader title={t("adminPages.settingsEmails.title")} subtitle={t("adminPages.settingsEmails.subtitle")} />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2 dark:border-white/8 dark:bg-[#1A1A22]">
          {isLoading ? <p className="text-sm text-slate-500">Loading templates...</p> : null}
          {isError ? <p className="text-sm text-red-500">{getErrorMessage(error, "Failed to load templates.")} <button onClick={() => refetch()} className="underline">Retry</button></p> : null}
          {templates.map((tpl) => <button key={tpl.id} onClick={() => { setSelectedId(tpl.id); setSubject(tpl.subject || ""); setBody(tpl.body || ""); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${selectedTemplate?.id === tpl.id ? "bg-[#EE7C11]/10 text-[#EE7C11] dark:bg-white/10 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}><span>{tpl.name}</span><span className="text-xs text-slate-500">{tpl.updatedAt ? new Date(tpl.updatedAt).toLocaleDateString() : "-"}</span></button>)}
        </div>
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3 dark:border-white/8 dark:bg-[#1A1A22]">
          <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" placeholder={t("adminPages.settingsEmails.subject")} value={subject || selectedTemplate?.subject || ""} onChange={(e) => setSubject(e.target.value)} />
          <textarea className="min-h-64 w-full rounded-lg border border-slate-200 p-3 font-mono text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200" value={body || selectedTemplate?.body || ""} onChange={(e) => setBody(e.target.value)} />
          <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-500 dark:border-white/10">{"{{student_name}} {{course_title}} {{reset_link}}"}</div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:text-slate-300">{t("adminPages.settingsEmails.preview")}</button>
            <button onClick={save} className="rounded-lg bg-[#EE7C11] px-3 py-2 text-sm font-bold text-white">{updateMutation.isPending || createMutation.isPending ? "Saving..." : t("adminPages.settingsEmails.sendTest")}</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SettingsEmails;

