import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageSquare, Plus } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useCreateTicket, useMyTickets } from "../../features/student/tickets/hooks";
import { getErrorMessage } from "../../api/error";

const STATUS_CLASS = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

export default function Tickets() {
  const { t } = useTranslation();
  const { data: tickets = [], isLoading, isError, error, refetch } = useMyTickets();
  const createTicket = useCreateTicket();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [formErr, setFormErr] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormErr("");
    try {
      await createTicket.mutateAsync({ subject, description, priority });
      setSubject("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setFormErr(getErrorMessage(err, t("student.tickets.createError", { defaultValue: "Could not create ticket." })));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title={t("student.tickets.title", { defaultValue: "Support" })}
          subtitle={t("student.tickets.subtitle", { defaultValue: "Open a ticket and our team will get back to you." })}
        />
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2.5 text-sm font-bold text-white hover:bg-pioneer-orange-hover"
        >
          <Plus className="h-4 w-4" />
          {t("student.tickets.new", { defaultValue: "New ticket" })}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={(e) => void handleCreate(e)} className="space-y-4 rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-700/40 dark:bg-[#1E293B]">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            minLength={3}
            placeholder={t("student.tickets.subjectPlaceholder", { defaultValue: "Subject" })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
            rows={4}
            placeholder={t("student.tickets.descriptionPlaceholder", { defaultValue: "Describe your issue…" })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
          >
            <option value="LOW">{t("student.tickets.priority.low", { defaultValue: "Low" })}</option>
            <option value="MEDIUM">{t("student.tickets.priority.medium", { defaultValue: "Medium" })}</option>
            <option value="HIGH">{t("student.tickets.priority.high", { defaultValue: "High" })}</option>
            <option value="URGENT">{t("student.tickets.priority.urgent", { defaultValue: "Urgent" })}</option>
          </select>
          {formErr ? <p className="text-sm text-red-600">{formErr}</p> : null}
          <button type="submit" disabled={createTicket.isPending} className="rounded-xl bg-pioneer-orange-normal px-5 py-2.5 text-sm font-bold text-white hover:bg-pioneer-orange-hover disabled:opacity-50">
            {t("student.tickets.submit", { defaultValue: "Submit ticket" })}
          </button>
        </form>
      ) : null}

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <div className="text-sm text-red-600">
          <p>{getErrorMessage(error, t("student.tickets.loadError", { defaultValue: "Could not load tickets." }))}</p>
          <button type="button" onClick={() => void refetch()} className="mt-2 font-semibold text-pioneer-orange-normal hover:underline">
            {t("takeExam.retry")}
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <MessageSquare className="h-12 w-12 text-slate-300" />
          <p className="text-slate-600">{t("student.tickets.empty", { defaultValue: "No support tickets yet." })}</p>
        </div>
      ) : null}

      {!isLoading && !isError && tickets.length > 0 ? (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                to={`/student/tickets/${ticket.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white px-5 py-4 transition hover:border-pioneer-orange-normal dark:border-slate-700/40 dark:bg-[#1E293B]"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : ""}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[ticket.status] || STATUS_CLASS.OPEN}`}>
                  {ticket.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
