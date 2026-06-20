import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAdminTicketById, useProcessAdminTicket, useReplyAdminTicket } from "../../features/admin/tickets/hooks";
import { getErrorMessage } from "../../api/error";

const statusClasses = {
  Open: "bg-blue-500/15 text-blue-400",
  "In Progress": "bg-purple-500/15 text-purple-400",
  Resolved: "bg-green-500/15 text-green-400",
  Closed: "bg-slate-500/15 text-slate-500",
};

function TicketDetail() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useAdminTicketById(id);
  const processMutation = useProcessAdminTicket();
  const replyMutation = useReplyAdminTicket();
  const ticket = useMemo(() => data || null, [data]);
  const [status, setStatus] = useState("IN_PROGRESS");
  const [reply, setReply] = useState("");
  const [notes, setNotes] = useState("");

  if (isLoading) return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-700 dark:border-white/10 dark:bg-[#1A1A22] dark:text-slate-300">Loading ticket...</div>;
  if (isError) return <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">{getErrorMessage(error, "Failed to load ticket.")}<button onClick={() => refetch()} className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white">Retry</button></div>;

  if (!ticket) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-700 dark:border-white/10 dark:bg-[#1A1A22] dark:text-slate-300">
        Ticket not found.
      </div>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{ticket.subject}</h1>
          <p className="mt-2 text-sm text-slate-500">
            From: {ticket?.createdBy?.email || "-"} • {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "-"} • {ticket.category || "-"} •{" "}
            <span className="font-semibold">{ticket.priority || "-"}</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
          <h2 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Original Message</h2>
          <p className="text-sm text-slate-600 dark:text-slate-200">{ticket.description}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
          <h2 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-300">Reply Thread</h2>
          <div className="space-y-3">
            {(ticket.messages || []).map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.senderRole === "ADMIN" ? "bg-[#EE7C11]/10 text-[#EE7C11] dark:text-red-300" : "bg-slate-100 text-slate-700 dark:bg-white/8 dark:text-slate-200"}`}>
                  <p>{msg.message}</p>
                  <p className="mt-1 text-[10px] opacity-70">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "-"}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-end gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder="Write your reply..."
              className="min-h-20 flex-1 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
            <button onClick={() => { if (reply.trim()) replyMutation.mutate({ id, message: reply }); }} className="inline-flex items-center gap-1 rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white hover:bg-[#d9700e]">
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      <aside className="space-y-6 lg:col-span-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
          <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-300">Ticket Info</h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Status: <span className="ms-2 inline-flex rounded-full px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">{ticket.status || status}</span></p>
            <p>Assigned to: {ticket?.assignedTo?.email || "-"}</p>
            <p>Created: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "-"}</p>
            <p>Updated: {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : "-"}</p>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Change Status</label>
            <select
              value={status}
              onChange={(e) => {
                if (window.confirm("Confirm status change?")) {
                  const next = e.target.value;
                  setStatus(next);
                  processMutation.mutate({ id, body: { status: next, response: notes || undefined } });
                }
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300"
            >
              {["IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
          <h3 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Internal Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200"
          />
        </div>
      </aside>
    </section>
  );
}

export default TicketDetail;

