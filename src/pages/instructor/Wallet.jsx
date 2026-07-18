import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  DollarSign, 
  Loader2, 
  Wallet as WalletIcon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Building2, 
  Smartphone, 
  User, 
  CheckCircle2, 
  XCircle, 
  Clock 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { getErrorMessage } from "../../api/error";
import { 
  useRequestPayout, 
  useWalletPayouts, 
  useWalletSummary, 
  useWalletTransactions 
} from "../../features/instructor/wallet/hooks";

// Custom validators with bilingual error messages
const payoutSchema = z.object({
  amount: z.coerce.number().positive("المبلغ يجب أن يكون أكبر من 0 / Amount must be greater than 0"),
  payoutMethod: z.enum(["BANK", "MOBILE_WALLET"]),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolderName: z.string().optional(),
  phoneNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.payoutMethod === "BANK") {
    if (!data.bankName || data.bankName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bankName"],
        message: "اسم البنك مطلوب / Bank name is required",
      });
    }
    if (!data.accountNumber || data.accountNumber.trim().length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accountNumber"],
        message: "رقم الحساب مطلوب (4 أرقام على الأقل) / Account number is required (min 4 chars)",
      });
    }
    if (!data.accountHolderName || data.accountHolderName.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accountHolderName"],
        message: "اسم المستفيد مطلوب (3 أحرف على الأقل) / Account holder name is required (min 3 chars)",
      });
    }
  } else if (data.payoutMethod === "MOBILE_WALLET") {
    if (!data.phoneNumber || !/^(010|011|012|015|\+2010|\+2011|\+2012|\+2015)\d{8}$/.test(data.phoneNumber.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneNumber"],
        message: "رقم هاتف محمول مصري صحيح مطلوب / Valid Egyptian mobile number is required",
      });
    }
  }
});

// Helper: formats currency
const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("en-US").format(num) + " EGP";
};

// Helper: formats dates cleanly in both Arabic and English
const formatDate = (dateString, isRtl) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    
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

// Helper: parses Payout details into beautiful stylized node
const parsePayoutDetails = (detailsStr, isRtl) => {
  if (!detailsStr) return "-";
  let details;
  try {
    details = typeof detailsStr === "string" ? JSON.parse(detailsStr) : detailsStr;
  } catch (e) {
    return <span className="text-slate-500 text-xs break-all">{detailsStr}</span>;
  }

  const nameElement = details.name ? (
    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
      <User className="h-3 w-3 text-slate-450 dark:text-slate-500" /> {details.name}
    </span>
  ) : null;

  if (details.bank) {
    let bankDisplayName = details.bank;
    if (details.bank.toUpperCase() === "CIB") {
      bankDisplayName = isRtl ? "البنك التجاري الدولي (CIB)" : "Commercial International Bank (CIB)";
    } else if (details.bank.toUpperCase() === "NBE") {
      bankDisplayName = isRtl ? "البنك الأهلي المصري (NBE)" : "National Bank of Egypt (NBE)";
    }
    
    const accountStr = details.account || details.accountNumber || "";
    const maskedAccount = accountStr.startsWith("****") ? accountStr : `****${accountStr.slice(-4)}`;

    return (
      <div className="flex flex-col text-xs md:text-sm">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <span>{bankDisplayName} • {isRtl ? "حساب" : "Acc:"} {maskedAccount}</span>
        </div>
        {nameElement}
      </div>
    );
  }

  if (details.phone || details.mobile || details.wallet) {
    const phoneNumber = details.phone || details.mobile || details.wallet;
    let maskedPhone = phoneNumber;
    let cleanPhone = String(phoneNumber).replace(/^\+2/, ""); 
    if (cleanPhone.length >= 10) {
      maskedPhone = `${cleanPhone.slice(0, 3)}*****${cleanPhone.slice(-2)}`;
    }

    let providerName = isRtl ? "فودافون كاش" : "Vodafone Cash";
    if (cleanPhone.startsWith("011") || cleanPhone.startsWith("11")) {
      providerName = isRtl ? "إيصال اتصالات كاش" : "Etisalat Cash";
    } else if (cleanPhone.startsWith("012") || cleanPhone.startsWith("12")) {
      providerName = isRtl ? "أورنج كاش" : "Orange Cash";
    } else if (cleanPhone.startsWith("015") || cleanPhone.startsWith("15")) {
      providerName = isRtl ? "وي باي (WE)" : "WE Pay";
    }

    return (
      <div className="flex flex-col text-xs md:text-sm">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <Smartphone className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <span>{providerName} • {maskedPhone}</span>
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
      <span className="font-medium text-slate-700 dark:text-slate-300">{summaryStr || "-"}</span>
      {nameElement}
    </div>
  );
};

function Wallet() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRtl = dir === "rtl";
  
  const [notice, setNotice] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const { data: summary } = useWalletSummary();
  const { data: transactions } = useWalletTransactions({ page: 1, limit: 20 });
  const { data: payouts } = useWalletPayouts();
  const requestMutation = useRequestPayout();

  const form = useForm({
    resolver: zodResolver(payoutSchema),
    defaultValues: { 
      amount: "", 
      payoutMethod: "BANK",
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      phoneNumber: "",
    },
  });

  const selectedMethod = form.watch("payoutMethod");

  const onSubmit = form.handleSubmit(async (values) => {
    setNotice(null);
    const balance = summary?.balance ?? 0;
    
    if (values.amount > balance) {
      form.setError("amount", {
        type: "manual",
        message: isRtl 
          ? "المبلغ المطلوب يتجاوز الرصيد المتاح حالياً." 
          : "Amount exceeds available balance.",
      });
      return;
    }

    try {
      let detailsObj = {};
      if (values.payoutMethod === "BANK") {
        detailsObj = {
          bank: values.bankName,
          account: values.accountNumber,
          name: values.accountHolderName,
        };
      } else {
        detailsObj = {
          phone: values.phoneNumber,
        };
      }
      
      const payload = {
        amount: Number(values.amount),
        payoutMethod: values.payoutMethod,
        payoutDetails: JSON.stringify(detailsObj),
      };

      await requestMutation.mutateAsync(payload);
      setNotice({ 
        type: "success", 
        message: isRtl ? "تم تقديم طلب السحب بنجاح." : "Payout requested successfully." 
      });
      setOpenModal(false);
      form.reset();
    } catch (err) {
      setNotice({ 
        type: "error", 
        message: getErrorMessage(err, isRtl ? "فشل تقديم طلب السحب." : "Payout request failed.") 
      });
    }
  });

  // Dynamic Status Badging Helper
  const renderStatusBadge = (status) => {
    const normalized = String(status).toUpperCase();
    if (normalized === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-550 dark:bg-emerald-400 animate-pulse" />
          {isRtl ? "مقبول" : "Approved"}
        </span>
      );
    }
    if (normalized === "PAID") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <CheckCircle2 className="h-3 w-3" />
          {isRtl ? "تم الدفع" : "Paid"}
        </span>
      );
    }
    if (normalized === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-550 dark:bg-amber-400 animate-pulse" />
          {isRtl ? "قيد المراجعة" : "Pending"}
        </span>
      );
    }
    if (normalized === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-550 dark:bg-rose-400" />
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
      <PageHeader
        title={t("dashboard.instructor.pages.wallet.title")}
        subtitle={t("dashboard.instructor.pages.wallet.subtitle")}
        actions={null}
      />

      <Notice type={notice?.type} message={notice?.message} />

      {/* Modern Financial Cards Grid with Soft Glows */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Available Balance Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md dark:shadow-slate-950/40 hover:shadow-orange-500/5 dark:hover:shadow-orange-500/10">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-[#EE7C11]/15 to-transparent blur-xl transition-all duration-500 group-hover:scale-150" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t("dashboard.instructor.wallet.balance")}
              </p>
              <h3 className="text-3xl font-black text-[#EE7C11] tracking-tight drop-shadow-[0_0_12px_rgba(238,124,17,0.1)]">
                {formatCurrency(summary?.balance ?? 0)}
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-[#EE7C11] dark:bg-[#EE7C11]/10">
              <WalletIcon className="h-5 w-5" />
            </div>
          </div>
          <button
            onClick={() => {
              setNotice(null);
              setOpenModal(true);
            }}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EE7C11] to-[#EE7C11]/90 hover:from-[#d9700e] hover:to-[#c4640d] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <DollarSign className="h-4 w-4" /> {t("dashboard.instructor.wallet.requestPayout")}
          </button>
        </div>

        {/* Total Earned Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md dark:shadow-slate-950/40 hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/15 to-transparent blur-xl transition-all duration-500 group-hover:scale-150" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t("dashboard.instructor.wallet.totalEarned")}
              </p>
              <h3 className="text-3xl font-black text-slate-850 dark:text-white tracking-tight">
                {formatCurrency(summary?.totalEarned ?? 0)}
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/10">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-8 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span className="font-bold text-emerald-555 dark:text-emerald-400">↑ {isRtl ? "أرباح نشطة" : "Active earnings"}</span>
            <span>{isRtl ? "من الكورسات والطلاب" : "from student cohorts"}</span>
          </div>
        </div>

        {/* Total Withdrawn Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md dark:shadow-slate-950/40 hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/15 to-transparent blur-xl transition-all duration-500 group-hover:scale-150" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t("dashboard.instructor.wallet.totalWithdrawn")}
              </p>
              <h3 className="text-3xl font-black text-slate-850 dark:text-white tracking-tight">
                {formatCurrency(summary?.totalWithdrawn ?? 0)}
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-500/10">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-8 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span className="font-bold text-blue-500">{(payouts || []).length}</span>
            <span>{isRtl ? "طلبات سحب تم تسجيلها" : "total payout requests"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Transactions Section */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/50 p-6 shadow-xl dark:border-slate-850 dark:bg-slate-900/40 dark:backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#EE7C11]" />
              {t("dashboard.instructor.wallet.transactions")}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {transactions?.transactions?.length || 0} {isRtl ? "عملية" : "transactions"}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-800/60 text-sm">
              <thead className="bg-slate-50/55 dark:bg-slate-950/40">
                <tr>
                  <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    {isRtl ? "النوع" : "Type"}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    {isRtl ? "البيان" : "Description"}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    {isRtl ? "المبلغ" : "Amount"}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    {isRtl ? "التاريخ" : "Date"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 bg-transparent">
                {(!transactions?.transactions || transactions.transactions.length === 0) ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      {isRtl ? "لا توجد معاملات بعد." : "No transactions recorded yet."}
                    </td>
                  </tr>
                ) : (
                  transactions.transactions.map((tx) => {
                    const isCredit = tx.type?.toUpperCase() === "CREDIT" || tx.type?.toUpperCase() === "EARNING" || tx.type?.toUpperCase() === "INCOME";
                    return (
                      <tr key={tx.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                            isCredit 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-450"
                          }`}>
                            {isCredit ? (
                              <ArrowDownLeft className="h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                            {isRtl 
                              ? (isCredit ? "أرباح" : "سحب") 
                              : (isCredit ? "Earning" : "Withdrawal")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {tx.description || "-"}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap font-bold ${
                          isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}>
                          {isCredit ? "+" : "-"}{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                          {formatDate(tx.createdAt, isRtl)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payout History Section */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/50 p-6 shadow-xl dark:border-slate-850 dark:bg-slate-900/40 dark:backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t("dashboard.instructor.wallet.payoutHistory")}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {payouts?.length || 0} {isRtl ? "طلب" : "requests"}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-800/60 text-sm">
              <thead className="bg-slate-50/55 dark:bg-slate-950/40">
                <tr>
                  <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    {isRtl ? "المبلغ" : "Amount"}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    {isRtl ? "الحالة" : "Status"}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    {isRtl ? "تفاصيل الدفع" : "Payout Details"}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    {isRtl ? "تاريخ الطلب" : "Requested Date"}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    {isRtl ? "تاريخ المعالجة" : "Processed Date"}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    {isRtl ? "الملاحظات والإيصال" : "Admin Notes & Receipt"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 bg-transparent">
                {(!payouts || payouts.length === 0) ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      {isRtl ? "لا توجد طلبات سحب بعد." : "No payout requests found."}
                    </td>
                  </tr>
                ) : (
                  payouts.map((payout) => (
                    <tr key={payout.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(payout.status)}
                      </td>
                      <td className="px-6 py-4">
                        {parsePayoutDetails(payout.payoutDetails, isRtl)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {formatDate(payout.createdAt, isRtl)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {payout.processedAt ? formatDate(payout.processedAt, isRtl) : (
                          <span className="text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-350 max-w-[200px] truncate">
                        <div className="flex flex-col gap-1">
                          {payout.adminNotes && (
                            <span className="text-xs text-slate-700 dark:text-slate-300 block truncate" title={payout.adminNotes}>
                              {payout.adminNotes}
                            </span>
                          )}
                          {payout.receiptUrl && (
                            <a
                              href={`${import.meta.env.VITE_API_URL || ""}${payout.receiptUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-[#EE7C11] hover:underline inline-flex items-center gap-1 mt-1"
                            >
                              📄 {isRtl ? "عرض الإيصال" : "View Receipt"}
                            </a>
                          )}
                          {!payout.adminNotes && !payout.receiptUrl && (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upgraded Premium Payout Dialog */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <form onSubmit={onSubmit} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#EE7C11]" />
                {t("dashboard.instructor.wallet.requestPayout")}
              </h3>
              <button 
                type="button" 
                onClick={() => setOpenModal(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            {/* Segmented Control for Payout Method Selection */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-2">
                {isRtl ? "طريقة استلام الأموال" : "Payout Method"}
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => form.setValue("payoutMethod", "BANK")}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                    selectedMethod === "BANK"
                      ? "bg-white text-[#EE7C11] shadow-sm dark:bg-slate-850 dark:text-[#EE7C11]"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  {isRtl ? "تحويل بنكي" : "Bank Transfer"}
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue("payoutMethod", "MOBILE_WALLET")}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                    selectedMethod === "MOBILE_WALLET"
                      ? "bg-white text-[#EE7C11] shadow-sm dark:bg-slate-850 dark:text-[#EE7C11]"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  {isRtl ? "محفظة موبايل" : "Mobile Wallet"}
                </button>
              </div>
            </div>

            {/* Dynamic Form Fields */}
            <div className="space-y-4">
              {selectedMethod === "BANK" ? (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      {isRtl ? "اسم البنك" : "Bank Name"}
                    </label>
                    <input
                      {...form.register("bankName")}
                      placeholder={isRtl ? "مثال: CIB أو البنك الأهلي" : "e.g., CIB, NBE"}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11] outline-none transition-all"
                    />
                    {form.formState.errors.bankName && (
                      <p className="mt-1 text-xs text-rose-500 font-medium">
                        {form.formState.errors.bankName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      {isRtl ? "رقم الحساب / الآيبان" : "Account Number / IBAN"}
                    </label>
                    <input
                      {...form.register("accountNumber")}
                      placeholder="e.g. 100023456789"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11] outline-none transition-all"
                    />
                    {form.formState.errors.accountNumber && (
                      <p className="mt-1 text-xs text-rose-500 font-medium">
                        {form.formState.errors.accountNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      {isRtl ? "الاسم الكامل للمستفيد" : "Beneficiary Full Name"}
                    </label>
                    <input
                      {...form.register("accountHolderName")}
                      placeholder={isRtl ? "الاسم كما هو مسجل في البنك" : "As registered at the bank"}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11] outline-none transition-all"
                    />
                    {form.formState.errors.accountHolderName && (
                      <p className="mt-1 text-xs text-rose-500 font-medium">
                        {form.formState.errors.accountHolderName.message}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    {isRtl ? "رقم الهاتف المحمول (فودافون كاش، إلخ)" : "Mobile Number (Vodafone Cash, etc.)"}
                  </label>
                  <input
                    {...form.register("phoneNumber")}
                    placeholder="e.g. 01012345678"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11] outline-none transition-all"
                  />
                  {form.formState.errors.phoneNumber && (
                    <p className="mt-1 text-xs text-rose-500 font-medium">
                      {form.formState.errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  {isRtl ? "قيمة المبلغ المطلوب" : "Payout Amount"}
                </label>
                <div className="relative">
                  <input
                    {...form.register("amount")}
                    placeholder="0.00"
                    type="number"
                    step="any"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pe-12 ps-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11] outline-none transition-all"
                  />
                  <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none text-xs font-bold text-slate-450 dark:text-slate-500">
                    EGP
                  </div>
                </div>
                {form.formState.errors.amount && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">
                    {form.formState.errors.amount.message}
                  </p>
                )}
                <p className="mt-1.5 text-[10px] text-slate-450 dark:text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-450" />
                  <span>{isRtl ? "الرصيد المتاح للسحب:" : "Available to withdraw:"}</span>
                  <span className="font-bold text-[#EE7C11]">{formatCurrency(summary?.balance ?? 0)}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-650 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800/60 transition-all"
              >
                {t("dashboard.common.cancel")}
              </button>
              <button 
                type="submit" 
                disabled={requestMutation.isPending} 
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#EE7C11] to-[#EE7C11]/90 hover:from-[#d9700e] hover:to-[#c4640d] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {requestMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} 
                {t("dashboard.common.submit")}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default Wallet;

