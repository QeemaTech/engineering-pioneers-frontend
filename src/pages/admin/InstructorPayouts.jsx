import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import { useAdminPayouts, useProcessPayout } from "../../features/admin/finance/hooks";
import { getErrorMessage } from "../../api/error";
import toast from "react-hot-toast";
import ProofLink from "../../components/ui/ProofLink";
import {
  Check,
  X,
  DollarSign,
  Calendar,
  TrendingUp,
  Building2,
  Smartphone,
  User,
  Clock,
  ArrowUpRight,
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Copy,
  CheckCheck
} from "lucide-react";

const PAYOUT_STATUSES = ["PENDING", "APPROVED", "REJECTED", "PAID"];

// Helper: formats currency
const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return `EGP ${new Intl.NumberFormat("en-US").format(num)}`;
};

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

function CopyButton({ text, label = "نسخ" }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label || "تم النسخ"}: ${text}`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      title={label}
      className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-[#EE7C11]/10 hover:text-[#EE7C11] dark:hover:bg-[#EE7C11]/20 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors"
    >
      {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? "تم النسخ" : label}</span>
    </button>
  );
}

// Helper: parses Payout details into full unmasked stylized node for admin
const parsePayoutDetails = (detailsStr, isRtl) => {
  if (!detailsStr) return "—";
  let details;
  try {
    details = typeof detailsStr === "string" ? JSON.parse(detailsStr) : detailsStr;
  } catch (e) {
    return <span className="text-slate-500 text-xs break-all">{detailsStr}</span>;
  }

  const nameElement = details.name ? (
    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
      <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
      <span>{details.name}</span>
      <CopyButton text={details.name} label={isRtl ? "نسخ الاسم" : "Copy Name"} />
    </div>
  ) : null;

  if (details.bank) {
    let bankDisplayName = details.bank;
    if (details.bank.toUpperCase() === "CIB") {
      bankDisplayName = isRtl ? "البنك التجاري الدولي (CIB)" : "Commercial International Bank (CIB)";
    } else if (details.bank.toUpperCase() === "NBE") {
      bankDisplayName = isRtl ? "البنك الأهلي المصري (NBE)" : "National Bank of Egypt (NBE)";
    }

    const accountStr = details.account || details.accountNumber || "";

    return (
      <div className="flex flex-col text-xs md:text-sm gap-0.5">
        <div className="flex flex-wrap items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <Building2 className="h-4 w-4 text-[#EE7C11] shrink-0" />
          <span>{bankDisplayName}</span>
          <span className="text-slate-400">•</span>
          <span className="font-mono text-slate-900 dark:text-white select-all">{accountStr}</span>
          {accountStr ? <CopyButton text={accountStr} label={isRtl ? "نسخ الحساب" : "Copy Acc"} /> : null}
        </div>
        {nameElement}
      </div>
    );
  }

  if (details.phone || details.mobile || details.wallet) {
    const phoneNumber = details.phone || details.mobile || details.wallet;
    const cleanPhone = String(phoneNumber).replace(/^\+2/, "");

    let providerName = isRtl ? "فودافون كاش" : "Vodafone Cash";
    if (cleanPhone.startsWith("011") || cleanPhone.startsWith("11")) {
      providerName = isRtl ? "اتصالات كاش" : "Etisalat Cash";
    } else if (cleanPhone.startsWith("012") || cleanPhone.startsWith("12")) {
      providerName = isRtl ? "أورنج كاش" : "Orange Cash";
    } else if (cleanPhone.startsWith("015") || cleanPhone.startsWith("15")) {
      providerName = isRtl ? "وي باي (WE)" : "WE Pay";
    }

    return (
      <div className="flex flex-col text-xs md:text-sm gap-0.5">
        <div className="flex flex-wrap items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <Smartphone className="h-4 w-4 text-[#EE7C11] shrink-0" />
          <span>{providerName}</span>
          <span className="text-slate-400">•</span>
          <span className="font-mono text-base font-black text-slate-900 dark:text-white select-all">{phoneNumber}</span>
          <CopyButton text={phoneNumber} label={isRtl ? "نسخ الرقم" : "Copy Phone"} />
        </div>
        {nameElement}
      </div>
    );
  }

  const summaryStr = Object.entries(details)
    .map(([key, val]) => `${key}: ${val}`)
    .join(" · ");

  return (
    <div className="flex flex-col text-xs md:text-sm">
      <span className="font-mono font-medium text-slate-800 dark:text-slate-200 select-all">{summaryStr || "—"}</span>
      {nameElement}
    </div>
  );
};

function InstructorPayouts() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRtl = dir === "rtl";

  const [statusFilter, setStatusFilter] = useState("");
  const [rejectPayoutId, setRejectPayoutId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [payPayoutId, setPayPayoutId] = useState(null);
  const [payNotes, setPayNotes] = useState("");
  const [payReceiptFile, setPayReceiptFile] = useState(null);

  const { data: payouts = [], isLoading, isError, error, refetch, isFetching } = useAdminPayouts({
    ...(statusFilter ? { status: statusFilter } : {}),
  });

  const processMutation = useProcessPayout();

  // Liquidity aggregators
  const paid = useMemo(
    () => payouts.filter((p) => p.status === "PAID").reduce((acc, p) => acc + Number(p.amount || 0), 0),
    [payouts]
  );

  const pendingAmount = useMemo(
    () => payouts.filter((p) => p.status === "PENDING" || p.status === "APPROVED").reduce((acc, p) => acc + Number(p.amount || 0), 0),
    [payouts]
  );

  const nextPending = useMemo(() => {
    const pend = payouts.filter((p) => p.status === "PENDING" || p.status === "APPROVED");
    if (!pend.length) return "—";
    const sorted = [...pend].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return sorted[0].createdAt ? formatDate(sorted[0].createdAt, isRtl) : "—";
  }, [payouts, isRtl]);

  const runProcess = async (id, status, notes = undefined) => {
    try {
      await processMutation.mutateAsync({ id, body: { status, adminNotes: notes } });
      toast.success(t("adminPages.payouts.updated", { defaultValue: "Payout updated." }));
      void refetch();
    } catch (e) {
      toast.error(getErrorMessage(e, t("adminPages.payouts.processFailed", { defaultValue: "Could not process payout." })));
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectPayoutId) return;
    if (!rejectionReason.trim()) {
      toast.error(isRtl ? "يرجى كتابة سبب الرفض" : "Please specify a rejection reason");
      return;
    }
    const id = rejectPayoutId;
    const notes = rejectionReason.trim();
    setRejectPayoutId(null);
    setRejectionReason("");
    await runProcess(id, "REJECTED", notes);
  };

  const handleConfirmPaid = async () => {
    if (!payPayoutId) return;
    if (!payReceiptFile) {
      toast.error(isRtl ? "ارفع إثبات التحويل قبل التحديد كمدفوع." : "Upload payout proof before marking PAID.");
      return;
    }

    const formData = new FormData();
    formData.append("status", "PAID");
    formData.append("adminNotes", payNotes.trim());
    formData.append("receipt", payReceiptFile);

    const id = payPayoutId;
    setPayPayoutId(null);
    setPayNotes("");
    setPayReceiptFile(null);

    try {
      await processMutation.mutateAsync({ id, body: formData });
      toast.success(t("adminPages.payouts.updated", { defaultValue: "Payout marked as paid." }));
      void refetch();
    } catch (e) {
      toast.error(getErrorMessage(e, t("adminPages.payouts.processFailed", { defaultValue: "Could not process payout." })));
    }
  };

  // Dynamic Status Badge Tone
  const renderStatusBadge = (status) => {
    const normalized = String(status).toUpperCase();
    if (normalized === "PAID") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Check className="h-3.5 w-3.5" />
          {isRtl ? "مدفوع" : "Paid"}
        </span>
      );
    }
    if (normalized === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {isRtl ? "مقبول" : "Approved"}
        </span>
      );
    }
    if (normalized === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-550 dark:bg-amber-400 animate-pulse" />
          {isRtl ? "قيد الانتظار" : "Pending"}
        </span>
      );
    }
    if (normalized === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <X className="h-3.5 w-3.5" />
          {isRtl ? "مرفوض" : "Rejected"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-semibold text-slate-500 border border-slate-500/20">
        {status}
      </span>
    );
  };

  return (
    <section className="space-y-8 min-h-screen text-slate-900 dark:text-slate-100">
      <PageHeader title={t("adminPages.payouts.title")} subtitle={t("adminPages.payouts.subtitle")} />

      {/* Glassmorphic Metric Blocks */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Total Paid Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-xl transition-all duration-500 group-hover:scale-150" />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t("adminPages.payouts.totalPaid", { defaultValue: "Total Paid" })}
              </p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                {formatCurrency(paid)}
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Pending Payouts Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent blur-xl transition-all duration-500 group-hover:scale-150" />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t("adminPages.payouts.pending", { defaultValue: "Pending Amount" })}
              </p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                {formatCurrency(pendingAmount)}
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-550 dark:bg-amber-500/10">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Next Scheduled Payout Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-[#EE7C11]/10 to-transparent blur-xl transition-all duration-500 group-hover:scale-150" />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t("adminPages.payouts.nextDate", { defaultValue: "Next Scheduled" })}
              </p>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight mt-1.5">
                {nextPending}
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EE7C11]/10 text-[#EE7C11]">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-md dark:border-slate-800 dark:bg-[#1E293B]">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t("adminPages.payouts.filterStatus", { defaultValue: "Status Filter" })}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11] transition-all"
          >
            <option value="">{t("adminPages.payouts.allStatuses", { defaultValue: "All Statuses" })}</option>
            {PAYOUT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-650 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-[#EE7C11]" : ""}`} />
          {isFetching ? t("dashboard.common.loading", { defaultValue: "Refreshing…" }) : t("dashboard.common.refresh", { defaultValue: "Refresh" })}
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-[#1E293B] font-bold flex items-center justify-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-[#EE7C11]" />
          {t("adminPages.payouts.loading", { defaultValue: "Loading payout records…" })}
        </div>
      ) : null}

      {/* Error state */}
      {isError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-slate-900 dark:text-red-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            <span className="font-semibold">{getErrorMessage(error, t("adminPages.payouts.loadError", { defaultValue: "Failed to load payouts." }))}</span>
            <button
              type="button"
              onClick={() => void refetch()}
              className="ms-auto rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] px-4 py-2 text-xs font-bold text-white transition-all"
            >
              {t("adminPages.payouts.retry", { defaultValue: "Retry" })}
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Ledger Table */}
      {!isLoading && !isError ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-850 dark:bg-[#1E293B]">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-950/40">
              <tr>
                <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                  {t("adminPages.payouts.instructor", { defaultValue: "Instructor" })}
                </th>
                <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                  {t("adminPages.payouts.amount", { defaultValue: "Amount" })}
                </th>
                <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                  {t("adminPages.payouts.status", { defaultValue: "Status" })}
                </th>
                <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                  {isRtl ? "تفاصيل الدفع" : "Payout Details"}
                </th>
                <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                  {t("adminPages.payouts.date", { defaultValue: "Requested" })}
                </th>
                <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                  {t("adminPages.payouts.notes", { defaultValue: "Admin Notes" })}
                </th>
                <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                  {isRtl ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 bg-transparent">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    {isRtl ? "لا توجد طلبات دفع مسجلة حالياً." : "No payout requests found."}
                  </td>
                </tr>
              ) : (
                payouts.map((r) => {
                  const busy = processMutation.isPending;
                  return (
                    <tr key={r.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/25">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-850 dark:text-white">
                            {r?.instructor?.fullName || "—"}
                          </span>
                          <span className="text-xs text-slate-450 dark:text-slate-500">
                            {r?.instructor?.email || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-black text-slate-900 dark:text-white">
                        {formatCurrency(r.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(r.status)}
                      </td>
                      <td className="px-6 py-4">
                        {parsePayoutDetails(r.payoutDetails, isRtl)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-550 dark:text-slate-450">
                        {formatDate(r.createdAt, isRtl)}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-350 max-w-[220px] truncate">
                        {r.adminNotes || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          if (r.status === "PAID") {
                            return (
                              <div className="flex flex-col items-start gap-1">
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-450 flex items-center gap-1">
                                  <Check className="h-4 w-4" />
                                  {isRtl ? "تم الدفع بنجاح" : "Paid"}
                                </span>
                                {r.receiptUrl && (
                                  <ProofLink
                                    proofPath={`/admin/payouts/${r.id}/proof`}
                                    storedUrl={r.receiptUrl}
                                    label={isRtl ? "عرض الإيصال" : "View Receipt"}
                                  />
                                )}
                              </div>
                            );
                          }
                          if (r.status === "REJECTED") {
                            return (
                              <span className="text-xs font-semibold text-rose-600 dark:text-rose-450 flex items-center gap-1">
                                <X className="h-4 w-4" />
                                {isRtl ? "مرفوض" : "Rejected"}
                              </span>
                            );
                          }
                          if (r.status === "PENDING") {
                            return (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => void runProcess(r.id, "APPROVED")}
                                  className="flex items-center gap-0.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all duration-200"
                                >
                                  {isRtl ? "قبول" : "Approve"} (✔)
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => {
                                    setRejectPayoutId(r.id);
                                    setRejectionReason("");
                                  }}
                                  className="flex items-center gap-0.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-450 border border-rose-500/20 transition-all duration-200 animate-fade-in"
                                >
                                  {isRtl ? "رفض" : "Reject"} (✖)
                                </button>
                              </div>
                            );
                          }
                          if (r.status === "APPROVED") {
                            return (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                  setPayPayoutId(r.id);
                                  setPayNotes("");
                                  setPayReceiptFile(null);
                                }}
                                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#EE7C11] to-[#EE7C11]/90 hover:from-[#d9700e] hover:to-[#c4640d] px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all duration-200 transform hover:scale-[1.02]"
                              >
                                <DollarSign className="h-3.5 w-3.5" />
                                {isRtl ? "تأكيد الدفع" : "Mark as Paid"}
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Safe Rejection Dialog Modal */}
      {rejectPayoutId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-205 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <X className="h-5 w-5 text-rose-500" />
              {isRtl ? "رفض طلب السحب" : "Reject Payout Request"}
            </h3>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {isRtl
                ? "يرجى تحديد سبب لرفض طلب السحب هذا. سيتم توجيه هذا السبب إلى المدرب وتوثيقه في النظام."
                : "Please capture the reason for rejecting this payout. This note will be visible to the instructor."}
            </p>

            <div className="mt-4">
              <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                {isRtl ? "سبب الرفض" : "Reason / Notes"}
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={isRtl ? "مثال: رقم الحساب غير صحيح أو بيانات البنك غير كاملة" : "e.g., Incomplete bank details"}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-105 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectPayoutId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-650 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800/60 transition-all"
              >
                {t("dashboard.common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="rounded-xl bg-rose-650 hover:bg-rose-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition-all duration-200"
              >
                {isRtl ? "تأكيد الرفض" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Completion Receipt Upload Dialog Modal */}
      {payPayoutId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-205 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              {isRtl ? "تأكيد تحويل الدفعة للمحاضر" : "Confirm Payout Transfer"}
            </h3>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? "تأكد من تحويل المبلغ إلى الحساب الموضح أدناه ثم أرفق إثبات التحويل لتأكيد العملية."
                : "Ensure funds are transferred to the account details below, then attach proof to complete payout."}
            </p>

            {(() => {
              const activePayoutItem = (payouts || []).find((p) => p.id === payPayoutId);
              if (!activePayoutItem) return null;
              return (
                <div className="mt-3 rounded-xl border border-orange-200/80 bg-orange-50/80 p-3.5 dark:border-orange-500/20 dark:bg-orange-950/20 space-y-2">
                  <div className="flex items-center justify-between border-b border-orange-200/60 dark:border-orange-500/20 pb-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        {activePayoutItem?.instructor?.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {activePayoutItem?.instructor?.email}
                      </p>
                    </div>
                    <span className="text-base font-black text-[#EE7C11]">
                      {formatCurrency(activePayoutItem?.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      {isRtl ? "بيانات حساب / محفظة المحاضر:" : "Instructor Account / Wallet:"}
                    </span>
                    {parsePayoutDetails(activePayoutItem?.payoutDetails, isRtl)}
                  </div>
                </div>
              );
            })()}

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  {isRtl ? "ملاحظات إضافية" : "Additional Notes"}
                </label>
                <textarea
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder={isRtl ? "مثال: تم التحويل بنجاح عبر فودافون كاش" : "e.g., Successfully transferred via Vodafone Cash"}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11] outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  {isRtl ? "إرفاق إثبات الدفع (اختياري)" : "Attach Receipt / Proof (Optional)"}
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setPayReceiptFile(e.target.files[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#EE7C11]/10 file:text-[#EE7C11] hover:file:bg-[#EE7C11]/20 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-105 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setPayPayoutId(null);
                  setPayNotes("");
                  setPayReceiptFile(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-650 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800/60 transition-all"
              >
                {t("dashboard.common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmPaid}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all duration-200"
              >
                {isRtl ? "تأكيد وإتمام الدفع" : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default InstructorPayouts;
