import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useMyTickets, useReplyTicket } from "../../features/student/tickets/hooks";
import { getErrorMessage } from "../../api/error";

export default function TicketDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: tickets = [], isLoading } = useMyTickets();
  const reply = useReplyTicket();
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  const ticket = useMemo(() => tickets.find((tk) => tk.id === id), [tickets, id]);
  const messages = ticket?.messages ?? [];

  const handleReply = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !id) return;
    setErr("");
    try {
      await reply.mutateAsync({ ticketId: id, message: text });
      setMessage("");
    } catch (e2) {
      setErr(getErrorMessage(e2, t("student.tickets.replyError", { defaultValue: "Could not send reply." })));
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>;
  }

  if (!ticket) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-slate-600">{t("student.tickets.notFound", { defaultValue: "Ticket not found." })}</p>
        <Link to="/student/tickets" className="text-sm font-semibold text-pioneer-orange-normal hover:underline">
          ← {t("student.tickets.back", { defaultValue: "Back to tickets" })}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/student/tickets" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-pioneer-orange-normal">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("student.tickets.back", { defaultValue: "Back to tickets" })}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{ticket.subject}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("student.tickets.statusLabel", { defaultValue: "Status" })}: {ticket.status} · {ticket.priority}
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-700/40 dark:bg-[#1E293B]">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">{t("student.tickets.noMessages", { defaultValue: "No messages yet." })}</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-[#0F172A]">
              <p className="text-sm text-slate-800 dark:text-slate-200">{msg.message}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
              </p>
            </div>
          ))
        )}
      </div>

      {ticket.status !== "CLOSED" ? (
        <form onSubmit={(e) => void handleReply(e)} className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder={t("student.tickets.replyPlaceholder", { defaultValue: "Write a reply…" })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-600 dark:bg-[#1E293B] dark:text-white"
          />
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <button
            type="submit"
            disabled={reply.isPending || !message.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-5 py-2.5 text-sm font-bold text-white hover:bg-pioneer-orange-hover disabled:opacity-50"
          >
            {reply.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("student.tickets.sendReply", { defaultValue: "Send reply" })}
          </button>
        </form>
      ) : null}
    </div>
  );
}
