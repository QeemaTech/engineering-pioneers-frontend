import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  CircleAlert,
  Clock,
  Eye,
  Plus,
  Search,
  Ticket,
} from "lucide-react";
import { useAdminTickets, useProcessAdminTicket } from "../../features/admin/tickets/hooks";
import { getErrorMessage } from "../../api/error";
import PermissionGate from "../../components/ui/PermissionGate";

const STATUS_OPTIONS = ["All", "Open", "In Progress", "Resolved", "Closed"];
const PRIORITY_OPTIONS = ["All", "High", "Medium", "Low"];

const priorityClasses = {
  High: "border border-red-500/20 bg-[#EE7C11]/15 text-red-400",
  Medium: "border border-amber-500/20 bg-amber-500/15 text-amber-400",
  Low: "border border-slate-500/20 bg-slate-500/15 text-slate-400",
};

const statusClasses = {
  Open: "bg-blue-500/15 text-blue-400",
  "In Progress": "bg-purple-500/15 text-purple-400",
  Resolved: "bg-green-500/15 text-green-400",
  Closed: "bg-slate-500/15 text-slate-500",
};

function Tickets() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { data, isLoading, isError, error, refetch } = useAdminTickets({ search: search || undefined, status: status === "All" ? undefined : status });
  const processMutation = useProcessAdminTicket();
  const tickets = (data?.tickets ?? []).map((ticket) => ({
    ...ticket,
    subject: ticket.subject || ticket.title || "Ticket",
    from: ticket.from || ticket.user?.email || "-",
    date: ticket.date || ticket.createdAt,
    category: ticket.category || ticket.type || "-",
    status: ticket.status || "Open",
    priority: ticket.priority || "Medium",
  }));

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "Open").length;
    const inProgress = tickets.filter((t) => t.status === "In Progress").length;
    const resolvedToday = tickets.filter((t) => t.status === "Resolved").length;
    return { open, inProgress, resolvedToday, monthTotal: tickets.length };
  }, [tickets]);

  const filtered = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        String(ticket.id).toLowerCase().includes(search.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
        ticket.from.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "All" || ticket.status === status;
      const matchesPriority = priority === "All" || ticket.priority === priority;
      const ticketDate = new Date(ticket.date).getTime();
      const afterFrom = !fromDate || ticketDate >= new Date(fromDate).getTime();
      const beforeTo = !toDate || ticketDate <= new Date(toDate).getTime() + 86399999;
      return matchesSearch && matchesStatus && matchesPriority && afterFrom && beforeTo;
    });
  }, [tickets, search, status, priority, fromDate, toDate]);

  return (
    <PermissionGate permission="support:manage" fallback={<p className="text-sm text-slate-500">You do not have access to support management.</p>}>
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support Tickets</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage student and instructor support requests
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d9700e]">
          <Plus className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Open Tickets</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.open}</p>
            </div>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <CircleAlert className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">In Progress</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.inProgress}</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Resolved Today</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.resolvedToday}</p>
            </div>
            <div className="rounded-lg bg-green-500/10 p-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Total This Month</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.monthTotal}</p>
            </div>
            <div className="rounded-lg bg-slate-500/10 p-2 text-slate-400">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white ps-9 pe-3 text-sm text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300 lg:col-span-2">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300 lg:col-span-2">
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300 lg:col-span-2" />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300 lg:col-span-2" />
        </div>
      </div>

      {isLoading ? <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">Loading tickets...</div> : null}
      {isError ? <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">{getErrorMessage(error, "Failed to load tickets.")}<button onClick={() => refetch()} className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white">Retry</button></div> : null}
      {!isLoading && !isError && tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-center dark:border-white/8 dark:bg-[#1A1A22]">
          <Ticket className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No tickets found</p>
          <p className="max-w-sm text-xs text-slate-500">Support requests will appear here when students or instructors submit them.</p>
        </div>
      ) : null}
      {!isLoading && !isError && tickets.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-slate-50 dark:bg-white/5">
                <tr className="text-start">
                  {["#", "Subject", "From", "Category", "Priority", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-start text-xs font-bold uppercase tracking-widest text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                      No tickets match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((ticket) => (
                    <tr key={ticket.id} className="group border-t border-slate-100 dark:border-white/6">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500">{ticket.id}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">{ticket.subject}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{ticket.from}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{ticket.category}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${priorityClasses[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${statusClasses[ticket.status]}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{new Date(ticket.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-70 transition group-hover:opacity-100">
                          <Link
                            to={`/admin/tickets/${ticket.id}`}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => processMutation.mutate({ id: ticket.id, body: { status: "RESOLVED", response: "" } })}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-green-500/15 hover:text-green-400"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
    </PermissionGate>
  );
}

export default Tickets;

