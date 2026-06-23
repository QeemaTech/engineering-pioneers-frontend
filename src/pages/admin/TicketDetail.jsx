import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { 
  Send, 
  User as UserIcon, 
  Mail, 
  Shield, 
  Clock, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Tag, 
  Lock,
  CornerDownRight 
} from "lucide-react";
import { useAdminTicketById, useProcessAdminTicket, useReplyAdminTicket } from "../../features/admin/tickets/hooks";
import { getErrorMessage } from "../../api/error";

// Dynamic status colors for badges
const statusClasses = {
  OPEN: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  IN_PROGRESS: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  CLOSED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
};

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

// Helper: formats dates cleanly in both Arabic and English
const formatDate = (dateString, isRtl) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    
    if (isRtl) {
      const day = date.getDate();
      const months = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
      ];
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "م" : "ص";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, "0");
      
      return `${day} ${monthName} ${year} - ${formattedHours}:${minutes} ${ampm}`;
    } else {
      const day = date.getDate();
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, "0");
      
      return `${day} ${monthName} ${year} - ${formattedHours}:${minutes} ${ampm}`;
    }
  } catch (e) {
    return dateString;
  }
};

// Helper: extracts user name initials
const getInitials = (name) => {
  if (!name) return "👤";
  const parts = String(name).split(" ").filter(Boolean);
  if (parts.length === 0) return "👤";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

function TicketDetail() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRtl = dir === "rtl";
  const { id } = useParams();

  const { data, isLoading, isError, error, refetch } = useAdminTicketById(id);
  const processMutation = useProcessAdminTicket();
  const replyMutation = useReplyAdminTicket();
  const ticket = useMemo(() => data || null, [data]);

  const [status, setStatus] = useState("IN_PROGRESS");
  const [reply, setReply] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (ticket?.status) {
      setStatus(String(ticket.status).toUpperCase());
    }
  }, [ticket?.status]);

  // Combine original message and reply thread chronologically
  const messagesList = useMemo(() => {
    if (!ticket) return [];
    
    // Check if the original ticket description is already mapped inside messages list.
    // If not, we prepend it as the first message.
    const hasOriginal = (ticket.messages || []).some(
      (m) => m.message === ticket.description && new Date(m.createdAt).getTime() === new Date(ticket.createdAt).getTime()
    );
    
    if (hasOriginal) return ticket.messages || [];
    
    const originalMsg = {
      id: "original",
      message: ticket.description,
      sender: "user",
      senderRole: "STUDENT",
      createdAt: ticket.createdAt,
    };
    
    return [originalMsg, ...(ticket.messages || [])];
  }, [ticket]);

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    try {
      await replyMutation.mutateAsync({ id, message: reply.trim() });
      toast.success(t("adminPages.tickets.replySent", { defaultValue: "Reply sent." }));
      setReply("");
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.tickets.replyFailed", { defaultValue: "Could not send reply." })));
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-[#1E293B] font-bold flex items-center justify-center gap-2">
        <Clock className="h-5 w-5 animate-spin text-[#EE7C11]" />
        {t("adminPages.tickets.loading", { defaultValue: "Loading tickets..." })}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-slate-900 dark:text-red-300">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500" />
          <span className="font-semibold">{getErrorMessage(error, t("adminPages.tickets.loadError", { defaultValue: "Failed to load ticket." }))}</span>
          <button 
            type="button" 
            onClick={() => refetch()} 
            className="ms-auto rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] px-4 py-2 text-xs font-bold text-white transition-all"
          >
            {t("adminPages.payouts.retry", { defaultValue: "Retry" })}
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-850 dark:bg-[#1E293B]">
        Ticket not found.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#1E293B] shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${statusClasses[ticket.status] || statusClasses.OPEN}`}>
                {t(`adminPages.tickets.statuses.${ticket.status}`, { defaultValue: ticket.status })}
              </span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                ticket.priority === "URGENT" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                ticket.priority === "HIGH" ? "bg-orange-500/10 text-[#EE7C11] border border-orange-500/20" :
                "bg-slate-500/10 text-slate-500 border border-slate-500/20"
              }`}>
                {ticket.priority || "MEDIUM"}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">{ticket.subject}</h1>
          </div>
          <div className="text-xs text-slate-450 dark:text-slate-500 flex flex-col items-end">
            <span>ID: {ticket.id}</span>
            <span className="mt-0.5">{isRtl ? "الفئة" : "Category"}: {ticket.category || "General"}</span>
          </div>
        </div>
      </div>

      {/* Two-Column Support Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Feed (65% Width) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col h-[650px] bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#EE7C11]" />
                {isRtl ? "محادثة الدعم الفني" : "Support Conversation Feed"}
              </h3>
              <span className="text-[10px] text-slate-400 dark:text-slate-550">
                {messagesList.length} {isRtl ? "رسائل" : "messages"}
              </span>
            </div>

            {/* Scrollable Message stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/10 flex flex-col">
              {messagesList.map((msg, idx) => {
                const isAdmin = msg.senderRole === "ADMIN" || msg.sender === "admin";
                
                return (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[85%] ${
                      isAdmin 
                        ? (isRtl ? "self-start items-start" : "self-end items-end") 
                        : (isRtl ? "self-end items-end" : "self-start items-start")
                    }`}
                  >
                    {/* Timestamp & User initials metadata */}
                    <div className={`flex items-center gap-2 mb-1.5 text-[11px] text-slate-450 dark:text-slate-500 ${
                      isAdmin ? "flex-row-reverse" : "flex-row"
                    }`}>
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                        isAdmin 
                          ? "bg-orange-500/15 text-[#EE7C11]" 
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}>
                        {isAdmin ? "AD" : getInitials(ticket.creator?.fullName)}
                      </div>
                      <span className="font-bold text-slate-650 dark:text-slate-350">
                        {isAdmin ? (ticket?.assignedTo?.fullName || "Admin Support") : (ticket?.creator?.fullName || "Requester")}
                      </span>
                      <span>•</span>
                      <span>{formatDate(msg.createdAt, isRtl)}</span>
                    </div>

                    {/* Chat Bubble */}
                    <div className={`p-4 text-sm leading-relaxed shadow-xs ${
                      isAdmin 
                        ? "bg-[#0F172A] border-l-4 border-l-[#EE7C11] border border-slate-200/50 dark:border-slate-800 text-white rounded-2xl rounded-tr-none"
                        : "bg-white/80 dark:bg-slate-900/60 border border-slate-200/55 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none backdrop-blur-xs"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Message Entry Console */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1E293B] flex items-end gap-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={2}
                placeholder={isRtl ? "اكتب رد الإدارة الفني..." : "Type support response..."}
                className="min-h-11 flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11] transition-all resize-none"
              />
              <button
                type="button"
                disabled={replyMutation.isPending || !reply.trim()}
                onClick={handleSendReply}
                className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#EE7C11] text-white hover:bg-[#d9700e] active:bg-[#c4640d] disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20 shrink-0"
              >
                {replyMutation.isPending ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Control Sidebar (35% Width) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Requester Identity Node */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#1E293B] shadow-md space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-[#EE7C11]" />
              {isRtl ? "بيانات صاحب التذكرة" : "Requester Profile"}
            </h3>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">
                  {isRtl ? "الاسم الكامل" : "Full Name"}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {ticket.creator?.fullName || "—"}
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">
                  {isRtl ? "البريد الإلكتروني" : "Email Address"}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 break-all">
                  {ticket.creator?.email || "—"}
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">
                  {isRtl ? "الدور الوظيفي" : "Active Role"}
                </span>
                <span className="inline-flex self-start items-center gap-1 mt-1.5 rounded-lg bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold text-[#EE7C11]">
                  <Shield className="h-3.5 w-3.5" />
                  {ticket.creator?.role?.name || "STUDENT"}
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">
                  {isRtl ? "حالة الحساب" : "Account Status"}
                </span>
                <span className="inline-flex self-start items-center gap-1 mt-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-550 dark:bg-emerald-400" />
                  {isRtl ? "نشط" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Unified Metadata Controller */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#1E293B] shadow-md space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#EE7C11]" />
              {isRtl ? "التحكم في التذكرة" : "Ticket Metadata"}
            </h3>
            
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-350">
              <div className="flex justify-between py-1 border-b border-slate-100/50 dark:border-slate-800/40">
                <span>{isRtl ? "المسؤول الحالي:" : "Assigned Admin:"}</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {ticket?.assignedTo?.email || (isRtl ? "غير معين" : "Unassigned")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100/50 dark:border-slate-800/40">
                <span>{isRtl ? "تاريخ الإنشاء:" : "Created Date:"}</span>
                <span>{formatDate(ticket.createdAt, isRtl)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100/50 dark:border-slate-800/40">
                <span>{isRtl ? "تاريخ التحديث:" : "Last Update:"}</span>
                <span>{formatDate(ticket.updatedAt, isRtl)}</span>
              </div>
            </div>

            <div className="mt-4 pt-2">
              <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-2">
                {isRtl ? "تغيير حالة التذكرة" : "Change Status"}
              </label>
              <select
                value={status}
                onChange={(e) => {
                  if (window.confirm("Confirm status change?")) {
                    const next = e.target.value;
                    setStatus(next);
                    processMutation.mutate({ id, body: { status: next, response: notes || undefined } });
                  }
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11] transition-all"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {t(`adminPages.tickets.statuses.${s}`, { defaultValue: s })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secure Internal Notes Box */}
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 dark:border-amber-500/15 space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Lock className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">
                {isRtl ? "ملاحظات داخلية خاصة" : "Secure Internal Notes"}
              </h3>
            </div>
            
            <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70 leading-normal">
              {isRtl 
                ? "🔒 هذه الملاحظات خاصة بمشرفي الدعم الفني ولن تظهر للمستخدم العادي. سيتم إرفاقها عند تغيير حالة التذكرة." 
                : "🔒 This field is private. Internal memo response sent along with status transitions."}
            </p>
            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder={isRtl ? "اكتب الملاحظات الداخلية الخاصة هنا..." : "Write secure internal notes..."}
              className="w-full rounded-xl border border-amber-500/10 bg-white p-3 text-sm text-slate-700 outline-none focus:border-[#EE7C11] dark:border-white/5 dark:bg-slate-900 dark:text-slate-200 transition-all resize-none"
            />
          </div>

        </aside>

      </div>
    </section>
  );
}

export default TicketDetail;
