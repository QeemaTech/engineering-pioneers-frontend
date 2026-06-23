import { 
  CalendarDays, Clock, MessageSquare, ShieldCheck, Star, UserX, 
  Wallet as WalletIcon, TrendingUp, CreditCard, ArrowUpRight, 
  ArrowDownLeft, BookOpen, Users, Award, Calendar, ChevronRight, Activity, DollarSign,
  Percent, Loader2, Pencil, X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from "recharts";
import {
  useAdminInstructorAvailability,
  useAdminInstructorById,
  useAdminInstructorPerformance,
  useUpdateInstructor,
} from "../../features/admin/instructors/hooks";
import DataTable from "../../components/ui/DataTable";
import { getErrorMessage } from "../../api/error";
import { useUpdateInstructorCommission } from "../../features/admin/finance/hooks";
import { useSetAdminUserPassword } from "../../features/admin/users/hooks";
import { useCreateAdminTicket } from "../../features/admin/tickets/hooks";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionGate from "../../components/ui/PermissionGate";

const COLORS = ["#EE7C11", "#14B8A6", "#8B5CF6", "#EF4444", "#3B82F6"];
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

function InstructorDetail() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: entity, isLoading, isError, error, refetch } = useAdminInstructorById(id);
  const performanceQuery = useAdminInstructorPerformance(id, { enabled: Boolean(id) && activeTab === "performance" });
  const availabilityQuery = useAdminInstructorAvailability(id, { enabled: Boolean(id) && activeTab === "availability" });
  const updateCommission = useUpdateInstructorCommission();
  const updateInstructor = useUpdateInstructor();
  const setPasswordMutation = useSetAdminUserPassword();
  const createTicketMutation = useCreateAdminTicket();
  const { hasPermission } = usePermissions();
  const canManageCommission = hasPermission("payout:manage");
  const canManageInstructor = hasPermission("instructor:manage");
  const [commissionInput, setCommissionInput] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    experience: 0,
    isActive: true,
  });
  const [newPassword, setNewPassword] = useState("");
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketPriority, setTicketPriority] = useState("MEDIUM");
  const profileSectionRef = useRef(null);

  useEffect(() => {
    if (!entity) return;
    setProfileForm({
      fullName: entity.fullName || "",
      email: entity.email || "",
      phone: entity.phone || "",
      bio: entity.bio || "",
      experience: entity.experience ?? 0,
      isActive: entity.isActive !== false,
    });
  }, [entity]);

  useEffect(() => {
    if (entity?.commissionRate != null) {
      setCommissionInput(String(entity.commissionRate));
    }
  }, [entity?.commissionRate]);

  const instructor = useMemo(() => {
    if (!entity) return null;
    const courses = entity.coursesInstructed || [];
    const totalStudents = courses.reduce((acc, c) => acc + (c._count?.purchases || 0), 0);
    const balance = entity.wallet?.balance ?? 0;
    const totalEarned = entity.wallet?.totalEarned ?? 0;
    const totalWithdrawn = entity.wallet?.totalWithdrawn ?? 0;
    const currency = entity.wallet?.currency || "EGP";
    const transactions = entity.wallet?.transactions || [];

    return {
      id: entity.id,
      name: entity.fullName || "-",
      email: entity.email || "-",
      bio: entity.bio || "-",
      phone: entity.phone || "-",
      experience: entity.experience || 0,
      isActive: entity.isActive,
      coursesCount: courses.length,
      totalStudents,
      rating: entity.averageRating || 0,
      commissionRate: entity.commissionRate ?? 80,
      wallet: {
        balance,
        totalEarned,
        totalWithdrawn,
        currency,
        transactions,
      }
    };
  }, [entity]);

  const courseRows = useMemo(() => {
    if (!entity?.coursesInstructed) return [];
    return entity.coursesInstructed.map((c) => ({
      id: c.id,
      title: c.title || "-",
      type: c.type || "RECORDED",
      students: c._count?.purchases || 0,
      rating: entity?.averageRating || 0,
      status: c.isActive ? t("adminPages.instructorDetail.active", { defaultValue: "Active" }) : t("adminPages.instructorDetail.inactive", { defaultValue: "Inactive" }),
    }));
  }, [entity, t]);

  // Payout requests embedded in instructor profile from API
  const payRows = useMemo(() => entity?.payoutRequests || [], [entity?.payoutRequests]);

  const coursesPie = useMemo(() => {
    const active = courseRows.filter((c) => c.status === t("adminPages.instructorDetail.active", { defaultValue: "Active" })).length;
    const inactive = courseRows.filter((c) => c.status === t("adminPages.instructorDetail.inactive", { defaultValue: "Inactive" })).length;
    return [
      { name: t("adminPages.instructorDetail.active", { defaultValue: "Active" }), value: active },
      { name: t("adminPages.instructorDetail.inactive", { defaultValue: "Inactive" }), value: inactive },
    ].filter(v => v.value > 0);
  }, [courseRows, t]);

  const enrollBars = useMemo(() => {
    return courseRows.map((c) => ({
      name: String(c.title || "-").slice(0, 15),
      enrollments: c.students || 0,
    }));
  }, [courseRows]);

  const earningsTrend = useMemo(() => {
    if (!instructor?.wallet?.transactions) return [];
    // Map transactions of type EARNING to build a history plot
    return instructor.wallet.transactions
      .filter((t) => t.type === "EARNING")
      .map((t) => ({
        date: new Date(t.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        amount: t.amount,
      }))
      .reverse();
  }, [instructor]);

  const commissionRateNum = Number(commissionInput);
  const commissionValid = !Number.isNaN(commissionRateNum) && commissionRateNum >= 0 && commissionRateNum <= 100;
  const platformShare = commissionValid ? 100 - commissionRateNum : 0;
  const exampleSale = 1000;
  const exampleInstructor = commissionValid ? Math.round((exampleSale * commissionRateNum) / 100) : 0;
  const examplePlatform = commissionValid ? exampleSale - exampleInstructor : 0;
  const commissionDirty = commissionValid && commissionRateNum !== instructor?.commissionRate;

  async function handleSaveCommission() {
    if (!commissionValid) {
      toast.error(t("adminPages.instructorDetail.wallet.commissionInvalid", { defaultValue: "Enter a rate between 0 and 100" }));
      return;
    }
    try {
      await updateCommission.mutateAsync({ instructorId: id, commissionRate: commissionRateNum });
      toast.success(t("adminPages.instructorDetail.wallet.commissionSaved", { defaultValue: "Commission rate updated" }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.instructorDetail.wallet.commissionSaveFailed", { defaultValue: "Failed to update commission rate" })));
    }
  }

  function resetProfileForm() {
    if (!entity) return;
    setProfileForm({
      fullName: entity.fullName || "",
      email: entity.email || "",
      phone: entity.phone || "",
      bio: entity.bio || "",
      experience: entity.experience ?? 0,
      isActive: entity.isActive !== false,
    });
    setNewPassword("");
  }

  async function handleSaveProfile() {
    const phone = profileForm.phone?.trim() || "";
    if (phone && !PHONE_REGEX.test(phone)) {
      toast.error(t("adminPages.instructorDetail.phoneInvalid", { defaultValue: "Phone must be 7–15 digits, optionally starting with +" }));
      return;
    }
    const experience = Number(profileForm.experience);
    if (Number.isNaN(experience) || experience < 0) {
      toast.error(t("adminPages.instructorDetail.profileSaveFailed", { defaultValue: "Failed to update instructor profile" }));
      return;
    }
    try {
      await updateInstructor.mutateAsync({
        id,
        body: {
          fullName: profileForm.fullName.trim(),
          email: profileForm.email.trim(),
          phone: phone || undefined,
          bio: profileForm.bio?.trim() || "",
          experience: Math.floor(experience),
          isActive: profileForm.isActive,
        },
      });
      toast.success(t("adminPages.instructorDetail.profileSaved", { defaultValue: "Instructor profile updated" }));
      setIsEditingProfile(false);
      setNewPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.instructorDetail.profileSaveFailed", { defaultValue: "Failed to update instructor profile" })));
    }
  }

  async function handleToggleStatus(nextActive) {
    try {
      await updateInstructor.mutateAsync({ id, body: { isActive: nextActive } });
      toast.success(t("adminPages.instructorDetail.statusUpdated", { defaultValue: "Instructor status updated" }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.instructorDetail.statusUpdateFailed", { defaultValue: "Failed to update instructor status" })));
    }
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 8) {
      toast.error(t("adminPages.instructorDetail.passwordTooShort", { defaultValue: "Password must be at least 8 characters" }));
      return;
    }
    try {
      await setPasswordMutation.mutateAsync({ id, newPassword });
      toast.success(t("adminPages.instructorDetail.passwordUpdated", { defaultValue: "Password updated successfully" }));
      setNewPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.instructorDetail.passwordUpdateFailed", { defaultValue: "Failed to update password" })));
    }
  }

  async function handleCreateTicket(e) {
    e.preventDefault();
    if (!ticketSubject.trim() || ticketMessage.trim().length < 10) {
      toast.error(t("adminPages.studentDetail.ticketValidation", { defaultValue: "Subject and message (min 10 chars) are required." }));
      return;
    }
    try {
      const ticket = await createTicketMutation.mutateAsync({
        creatorId: id,
        subject: ticketSubject.trim(),
        description: ticketMessage.trim(),
        priority: ticketPriority,
      });
      toast.success(t("adminPages.studentDetail.ticketCreated", { defaultValue: "Support ticket created." }));
      setTicketModalOpen(false);
      setTicketSubject("");
      setTicketMessage("");
      if (ticket?.id) navigate(`/admin/tickets/${ticket.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.studentDetail.ticketFailed", { defaultValue: "Could not create ticket." })));
    }
  }

  function openProfileEditor() {
    setActiveTab("overview");
    setIsEditingProfile(true);
    requestAnimationFrame(() => {
      profileSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EE7C11] border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("adminPages.instructorDetail.loadingProfile", { defaultValue: "Loading instructor profile..." })}
          </p>
        </div>
      </div>
    );
  }

  if (isError || !instructor) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20">
          <UserX className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {t("adminPages.instructorDetail.loadErrorTitle", { defaultValue: "Failed to load instructor" })}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {getErrorMessage(error, t("adminPages.instructorDetail.loadErrorDesc", { defaultValue: "The instructor details could not be retrieved." }))}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => refetch()} className="rounded-xl bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#d9700e]">
            {t("takeExam.retry", { defaultValue: "Retry" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6 antialiased">
      {/* Premium Header Profile Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-gradient-to-tr from-[#EE7C11]/10 to-[#EE7C11]/20 blur-xl"></div>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xl font-extrabold text-white shadow-md shadow-indigo-500/20">
              {instructor.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">{instructor.name}</h1>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  instructor.isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                }`}>
                  {instructor.isActive ? t("adminPages.instructorDetail.active", { defaultValue: "Active" }) : t("adminPages.instructorDetail.inactive", { defaultValue: "Inactive" })}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{instructor.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openProfileEditor}
              className="inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-[#EE7C11]/20 transition hover:bg-[#d9700e]"
            >
              <Pencil className="h-4 w-4" />
              {t("adminPages.instructorDetail.editProfile", { defaultValue: "Edit profile" })}
            </button>
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>{Number(instructor.rating || 0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <Award className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <span>{instructor.experience} {t("adminPages.instructorDetail.yearsExp", { defaultValue: "Years Exp" })}</span>
            </div>
          </div>
        </div>

        {instructor.bio && instructor.bio !== "-" ? (
          <p className="mt-5 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600 dark:border-white/5 dark:text-slate-300">
            {instructor.bio}
          </p>
        ) : null}

        {/* Modern Custom Tabs */}
        <div className="mt-6 flex overflow-x-auto border-t border-slate-100 pt-4 dark:border-white/5">
          <nav className="flex gap-2">
            {[
              { id: "overview", label: t("adminPages.instructorDetail.tabOverview", { defaultValue: "Overview" }), icon: Activity },
              { id: "wallet", label: t("adminPages.instructorDetail.tabWallet", { defaultValue: "Wallet & Financials" }), icon: WalletIcon },
              { id: "courses", label: t("adminPages.instructorDetail.tabCourses", { defaultValue: "Courses" }), icon: BookOpen },
              { id: "availability", label: t("adminPages.instructorDetail.tabAvailability", { defaultValue: "Availability Slots" }), icon: Calendar },
              { id: "reviews", label: t("adminPages.instructorDetail.tabReviews", { defaultValue: "Student Reviews" }), icon: MessageSquare },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                    isSelected
                      ? "bg-[#EE7C11] text-white shadow-sm shadow-[#EE7C11]/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300 dark:hover:bg-white/5"
                  }`}
                >
                  <TabIcon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" ? (
        <div className="space-y-6">
          {/* Main Stat Widgets */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.instructorDetail.totalCourses", { defaultValue: "Total Courses" })}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{instructor.coursesCount}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.instructorDetail.totalStudents", { defaultValue: "Enrolled Students" })}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{instructor.totalStudents}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.instructorDetail.walletBalance", { defaultValue: "Wallet Balance" })}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                  <WalletIcon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {instructor.wallet.balance.toLocaleString()} <span className="text-xs font-medium text-slate-500">{instructor.wallet.currency}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.instructorDetail.totalEarnings", { defaultValue: "Total Earnings" })}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {instructor.wallet.totalEarned.toLocaleString()} <span className="text-xs font-medium text-slate-500">{instructor.wallet.currency}</span>
              </p>
            </div>
          </div>

          {/* Charts & Details Panel */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left: General Info and Enrollments */}
            <div className="space-y-6 lg:col-span-3">
              {/* Profile Bio Details */}
              <div ref={profileSectionRef} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    {t("adminPages.instructorDetail.profileInfo", { defaultValue: "Profile Information" })}
                  </h3>
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t("adminPages.instructorDetail.editProfile", { defaultValue: "Edit profile" })}
                    </button>
                  ) : null}
                </div>

                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">
                          {t("adminPages.userDirectory.slideDetails.fullName", { defaultValue: "Full Name" })}
                        </label>
                        <input
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">
                          {t("adminPages.userDirectory.slideDetails.email", { defaultValue: "Email Address" })}
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">
                          {t("adminPages.userDirectory.slideDetails.phone", { defaultValue: "Phone Number" })}
                        </label>
                        <input
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="+201234567890"
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">
                          {t("adminPages.instructorDetail.experience", { defaultValue: "Experience" })}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={profileForm.experience}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, experience: e.target.value }))}
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">
                        {t("adminPages.instructorDetail.bio", { defaultValue: "Bio" })}
                      </label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                      />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={profileForm.isActive}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 accent-[#EE7C11]"
                      />
                      {t("adminPages.instructorDetail.active", { defaultValue: "Active" })}
                    </label>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                        {t("adminPages.instructorDetail.changePassword", { defaultValue: "Change password" })}
                      </p>
                      <p className="mt-1 text-xs text-amber-700/90 dark:text-amber-200/80">
                        {t("adminPages.instructorDetail.passwordHint", { defaultValue: "Changing the password signs the instructor out of existing sessions." })}
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t("adminPages.instructorDetail.newPassword", { defaultValue: "New password" })}
                          className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleChangePassword}
                          disabled={setPasswordMutation.isPending || !newPassword}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-100 px-4 text-xs font-bold text-amber-900 transition hover:bg-amber-200 disabled:opacity-60 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-100"
                        >
                          {setPasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {t("adminPages.instructorDetail.changePassword", { defaultValue: "Change password" })}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => {
                          resetProfileForm();
                          setIsEditingProfile(false);
                        }}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                      >
                        {t("adminPages.instructorDetail.cancelEdit", { defaultValue: "Cancel" })}
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={updateInstructor.isPending}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#EE7C11] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#d9700e] disabled:opacity-60"
                      >
                        {updateInstructor.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {t("adminPages.instructorDetail.saveProfile", { defaultValue: "Save changes" })}
                      </button>
                    </div>
                  </div>
                ) : (
                  <dl className="grid gap-y-4 text-sm sm:grid-cols-2 sm:gap-x-6">
                    <div>
                      <dt className="text-xs font-semibold text-slate-400">
                        {t("adminPages.userDirectory.slideDetails.fullName", { defaultValue: "Full Name" })}
                      </dt>
                      <dd className="mt-1 font-bold text-slate-900 dark:text-white">{instructor.name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-slate-400">
                        {t("adminPages.userDirectory.slideDetails.email", { defaultValue: "Email Address" })}
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{instructor.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-slate-400">
                        {t("adminPages.userDirectory.slideDetails.phone", { defaultValue: "Phone Number" })}
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{instructor.phone || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-slate-400">
                        {t("adminPages.instructorDetail.experience", { defaultValue: "Experience" })}
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                        {instructor.experience} {t("adminPages.instructorDetail.years", { defaultValue: "Years" })}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold text-slate-400">
                        {t("adminPages.instructorDetail.bio", { defaultValue: "Bio" })}
                      </dt>
                      <dd className="mt-1 font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                        {instructor.bio && instructor.bio !== "-" ? instructor.bio : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-slate-400">
                        {t("adminPages.instructorDetail.commissionRate", { defaultValue: "Commission rate" })}
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                        {instructor.commissionRate}% {t("adminPages.instructorDetail.wallet.commissionInstructor", { defaultValue: "Instructor share" }).toLowerCase()}
                        <span className="text-slate-400"> · </span>
                        {100 - instructor.commissionRate}% {t("adminPages.instructorDetail.wallet.commissionPlatform", { defaultValue: "Platform share" }).toLowerCase()}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>

              {/* Bar Chart: Enrollments */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.instructorDetail.studentsPerCourse", { defaultValue: "Students per Course" })}
                </h3>
                {enrollBars.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    {t("adminPages.instructorDetail.noCourses", { defaultValue: "No courses available for this instructor yet." })}
                  </p>
                ) : (
                  <div className="h-64" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={enrollBars}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.3} />
                        <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                        <Bar dataKey="enrollments" fill="#EE7C11" radius={[6, 6, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Pie chart and layout widgets */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.instructorDetail.courseVisibility", { defaultValue: "Course Visibility Mix" })}
                </h3>
                {coursesPie.length === 0 ? (
                  <p className="py-12 text-center text-sm text-slate-500">
                    {t("adminPages.instructorDetail.noCoursesYet", { defaultValue: "No courses created yet." })}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-44 w-full" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={coursesPie} 
                            dataKey="value" 
                            nameKey="name" 
                            outerRadius={65} 
                            innerRadius={35}
                            paddingAngle={4}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            fontSize={10}
                          >
                            {coursesPie.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Action Sidebar block */}
              <div className="space-y-2 rounded-2xl border border-[#EE7C11]/10 bg-slate-50/50 p-5 dark:border-white/5 dark:bg-white/5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.instructorDetail.quickActions", { defaultValue: "Quick Actions" })}
                </h3>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(true)}
                  disabled={!canManageInstructor || instructor.isActive || updateInstructor.isPending}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-bold transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200 dark:hover:bg-emerald-500/10"
                >
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                  {t("adminPages.instructorDetail.approve")}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(false)}
                  disabled={!canManageInstructor || !instructor.isActive || updateInstructor.isPending}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-bold transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200 dark:hover:bg-amber-500/10"
                >
                  <UserX className="h-4.5 w-4.5 text-amber-600" />
                  {t("adminPages.instructorDetail.suspend")}
                </button>
                <PermissionGate permission="support:manage">
                  <button
                    type="button"
                    onClick={() => {
                      setTicketSubject(isRtl ? `رسالة للمدرّس: ${instructor.name}` : `Message to instructor: ${instructor.name}`);
                      setTicketMessage("");
                      setTicketModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-[#EE7C11]/40 hover:bg-[#EE7C11]/5 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200"
                  >
                    <MessageSquare className="h-4.5 w-4.5 text-[#EE7C11]" />
                    {t("adminPages.instructorDetail.sendMessage")}
                  </button>
                </PermissionGate>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Wallet & Financials Tab */}
      {activeTab === "wallet" ? (
        <div className="space-y-6">
          {/* Commission rate settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                    <Percent className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("adminPages.instructorDetail.wallet.commissionTitle", { defaultValue: "Revenue Share" })}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("adminPages.instructorDetail.wallet.commissionSubtitle", {
                    defaultValue: "Percentage of each sale credited to this instructor. The platform keeps the remainder.",
                  })}
                </p>
              </div>
              {commissionDirty && canManageCommission ? (
                <button
                  type="button"
                  onClick={handleSaveCommission}
                  disabled={updateCommission.isPending}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#EE7C11] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#d9700e] disabled:opacity-60"
                >
                  {updateCommission.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t("adminPages.instructorDetail.wallet.commissionSave", { defaultValue: "Save commission rate" })}
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.instructorDetail.wallet.commissionRate", { defaultValue: "Instructor rate (%)" })}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={commissionValid ? commissionRateNum : instructor.commissionRate}
                    onChange={(e) => setCommissionInput(e.target.value)}
                    disabled={!canManageCommission}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#EE7C11] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/10"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={commissionInput}
                      onChange={(e) => setCommissionInput(e.target.value)}
                      disabled={!canManageCommission}
                      className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm font-bold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </div>
                {!commissionValid ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {t("adminPages.instructorDetail.wallet.commissionInvalid", { defaultValue: "Enter a rate between 0 and 100" })}
                  </p>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${commissionValid ? commissionRateNum : instructor.commissionRate}%` }}
                    title={t("adminPages.instructorDetail.wallet.commissionInstructor", { defaultValue: "Instructor share" })}
                  />
                  <div
                    className="bg-slate-400 transition-all dark:bg-slate-500"
                    style={{ width: `${commissionValid ? platformShare : 100 - instructor.commissionRate}%` }}
                    title={t("adminPages.instructorDetail.wallet.commissionPlatform", { defaultValue: "Platform share" })}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {t("adminPages.instructorDetail.wallet.commissionInstructor", { defaultValue: "Instructor share" })}: {commissionValid ? commissionRateNum : instructor.commissionRate}%
                  </span>
                  <span className="text-slate-500">
                    {t("adminPages.instructorDetail.wallet.commissionPlatform", { defaultValue: "Platform share" })}: {commissionValid ? platformShare : 100 - instructor.commissionRate}%
                  </span>
                </div>
                <p className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600 dark:border-white/5 dark:bg-white/5 dark:text-slate-300">
                  {t("adminPages.instructorDetail.wallet.commissionExample", {
                    defaultValue: "On a {{amount}} {{currency}} sale, instructor earns {{instructorAmount}} {{currency}} and platform keeps {{platformAmount}} {{currency}}.",
                    amount: exampleSale.toLocaleString(),
                    currency: instructor.wallet.currency,
                    instructorAmount: exampleInstructor.toLocaleString(),
                    platformAmount: examplePlatform.toLocaleString(),
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Financial summary banner */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-500/10 dark:bg-[#1A1A22]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {t("adminPages.instructorDetail.wallet.currentBalance", { defaultValue: "Current Balance" })}
                </span>
                <WalletIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {instructor.wallet.balance.toLocaleString()} <span className="text-xs font-semibold text-slate-500">{instructor.wallet.currency}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 dark:border-emerald-500/10 dark:bg-[#1A1A22]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t("adminPages.instructorDetail.wallet.totalRevenue", { defaultValue: "Total Revenue" })}
                </span>
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {instructor.wallet.totalEarned.toLocaleString()} <span className="text-xs font-semibold text-slate-500">{instructor.wallet.currency}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 dark:border-red-500/10 dark:bg-[#1A1A22]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  {t("adminPages.instructorDetail.wallet.totalWithdrawn", { defaultValue: "Total Withdrawn" })}
                </span>
                <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {instructor.wallet.totalWithdrawn.toLocaleString()} <span className="text-xs font-semibold text-slate-500">{instructor.wallet.currency}</span>
              </p>
            </div>
          </div>

          {/* Earnings Trend Graphic */}
          {earningsTrend.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                {t("adminPages.instructorDetail.wallet.earningsHistory", { defaultValue: "Earnings History Curve" })}
              </h3>
              <div className="h-56" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip />
                    <Area type="monotone" dataKey="amount" stroke="#EE7C11" fill="url(#colorEarning)" strokeWidth={2.5} />
                    <defs>
                      <linearGradient id="colorEarning" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EE7C11" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#EE7C11" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          {/* Double Column for Transactions vs Payout Requests */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Wallet Ledger Transactions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                {t("adminPages.instructorDetail.wallet.transactions", { defaultValue: "Wallet Transactions" })}
              </h3>
              {instructor.wallet.transactions.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  {t("adminPages.instructorDetail.wallet.noTransactions", { defaultValue: "No transactions recorded yet in this wallet." })}
                </div>
              ) : (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {instructor.wallet.transactions.map((tx, txIdx) => {
                      const isEarning = tx.type === "EARNING";
                      return (
                        <li key={tx.id}>
                          <div className="relative pb-8">
                            {txIdx !== instructor.wallet.transactions.length - 1 ? (
                              <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-100 dark:bg-white/5" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3 rtl:space-x-reverse">
                              <div>
                                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-8 ring-white dark:ring-[#1A1A22] ${
                                  isEarning ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                                }`}>
                                  {isEarning ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.description || (isEarning ? "Earnings Credited" : "Withdrawal Made")}</p>
                                  <p className="mt-0.5 text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="whitespace-nowrap text-end text-sm font-black">
                                  <span className={isEarning ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                                    {isEarning ? "+" : "-"} {tx.amount}
                                  </span>
                                  <p className="text-[10px] font-medium text-slate-400">{instructor.wallet.currency}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Payout Requests */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.instructorDetail.wallet.payoutRequests", { defaultValue: "Payout Requests" })}
                </h3>
                {payRows.length > 0 ? (
                  <Link
                    to="/admin/instructors/payouts"
                    className="text-xs font-bold text-[#EE7C11] hover:underline"
                  >
                    {t("adminPages.instructorDetail.wallet.managePayouts", { defaultValue: "Manage all payouts" })}
                  </Link>
                ) : null}
              </div>
              {payRows.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  {t("adminPages.instructorDetail.wallet.noPayouts", { defaultValue: "No payout requests submitted yet." })}
                </div>
              ) : (
                <DataTable
                  columns={[
                    {
                      key: "createdAt",
                      title: t("adminPages.instructorDetail.wallet.requestDate", { defaultValue: "Request Date" }),
                      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
                    },
                    {
                      key: "amount",
                      title: t("adminPages.instructorDetail.wallet.amountRequested", { defaultValue: "Amount Requested" }),
                      render: (v) => `${Number(v || 0).toLocaleString()} ${instructor.wallet.currency}`,
                    },
                    {
                      key: "payoutMethod",
                      title: t("adminPages.instructorDetail.wallet.payoutMethod", { defaultValue: "Method" }),
                      render: (v) => (v === "MOBILE_WALLET" ? "Mobile wallet" : v === "BANK" ? "Bank" : v || "—"),
                    },
                    { 
                      key: "status", 
                      title: t("adminPages.instructorDetail.wallet.status", { defaultValue: "Status" }),
                      render: (v) => {
                        const statusColors = {
                          PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
                          APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
                          REJECTED: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
                          PAID: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
                        };
                        return (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[v] || ""}`}>
                            {v}
                          </span>
                        );
                      }
                    },
                  ]}
                  rows={payRows}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Courses Tab */}
      {activeTab === "courses" ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
            {t("adminPages.instructorDetail.courses.title", { defaultValue: "Instructor's Courses" })}
          </h3>
          {courseRows.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              {t("adminPages.instructorDetail.courses.empty", { defaultValue: "No courses listed for this instructor." })}
            </p>
          ) : (
            <DataTable
              columns={[
                { key: "title", title: t("adminPages.instructorDetail.courses.colTitle", { defaultValue: "Course Title" }) },
                { key: "type", title: t("adminPages.instructorDetail.courses.colType", { defaultValue: "Type" }) },
                { key: "students", title: t("adminPages.instructorDetail.courses.colStudents", { defaultValue: "Enrolled Students" }) },
                { key: "rating", title: t("adminPages.instructorDetail.courses.colRating", { defaultValue: "Rating" }), render: (v) => `★ ${Number(v || 0).toFixed(1)}` },
                { 
                  key: "status", 
                  title: t("adminPages.instructorDetail.courses.colStatus", { defaultValue: "Publishing Status" }),
                  render: (v) => (
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      v === t("adminPages.instructorDetail.active", { defaultValue: "Active" }) ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-300"
                    }`}>
                      {v}
                    </span>
                  )
                },
              ]}
              rows={courseRows}
            />
          )}
        </div>
      ) : null}

      {/* Availability Tab */}
      {activeTab === "availability" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
            <h3 className="font-bold text-slate-900 dark:text-white">
              {t("adminPages.instructorDetail.availability.title", { defaultValue: "Availability Slots" })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("adminPages.instructorDetail.availability.subtitle", { defaultValue: "Active calendar slots configured by the instructor for student bookings" })}
            </p>
          </div>

          {availabilityQuery.isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">
              {t("adminPages.instructorDetail.availability.loading", { defaultValue: "Loading availability..." })}
            </div>
          ) : availabilityQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-[#EE7C11]/10 p-5 text-sm text-red-700 dark:border-red-500/30">
              {t("adminPages.instructorDetail.availability.loadError", { defaultValue: "Failed to load instructor slots." })}
              <button onClick={() => availabilityQuery.refetch()} className="ms-3 rounded-lg bg-[#EE7C11] px-3 py-1 text-xs font-bold text-white">
                {t("adminPages.instructorDetail.availability.refresh", { defaultValue: "Refresh" })}
              </button>
            </div>
          ) : !(availabilityQuery.data || []).length ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-sm text-slate-500 dark:border-white/10">
              <Calendar className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              {t("adminPages.instructorDetail.availability.empty", { defaultValue: "No upcoming availability slots published yet." })}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {(availabilityQuery.data || []).map((slot) => (
                <div key={slot.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {t("adminPages.instructorDetail.availabilitySlotStatus", { defaultValue: "Available" })}
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-white truncate">
                      {new Date(slot.startTime).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(slot.startTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} - {new Date(slot.endTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Reviews Tab */}
      {activeTab === "reviews" ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
            {t("adminPages.instructorDetail.reviews.title", { defaultValue: "Student Reviews & Ratings" })}
          </h3>
          {!(entity?.receivedReviews || []).length ? (
            <div className="py-12 text-center text-sm text-slate-500">
              {t("adminPages.instructorDetail.reviews.empty", { defaultValue: "No reviews published yet for this instructor." })}
            </div>
          ) : (
            <div className="space-y-4">
              {(entity?.receivedReviews || []).map((r) => (
                <div key={r.id} className="flex flex-col gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                      {r?.student?.fullName || t("adminPages.instructorDetail.reviews.anonymous", { defaultValue: "Anonymous Student" })}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {r.rating || 5}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {r.comment || t("adminPages.instructorDetail.reviews.ratingOnly", { defaultValue: "Left rating only (no written review)." })}
                  </p>
                  <p className="text-[10px] text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {ticketModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateTicket} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1A1A22]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("adminPages.instructorDetail.sendMessage")}
              </h3>
              <button type="button" onClick={() => setTicketModalOpen(false)} className="text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-3 text-xs text-slate-500">
              {t("adminPages.instructorDetail.ticketHint", { defaultValue: "Creates a support ticket linked to this instructor." })}
            </p>
            <input
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="mb-3 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              placeholder={t("adminPages.tickets.table.subject", { defaultValue: "Subject" })}
              required
            />
            <textarea
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              rows={4}
              className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              placeholder={isRtl ? "نص الرسالة للمدرّس..." : "Message to the instructor..."}
              required
            />
            <select
              value={ticketPriority}
              onChange={(e) => setTicketPriority(e.target.value)}
              className="mb-4 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            >
              {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setTicketModalOpen(false)} className="rounded-xl border px-4 py-2 text-sm font-semibold dark:border-white/10 dark:text-slate-200">
                {t("dashboard.common.cancel")}
              </button>
              <button
                type="submit"
                disabled={createTicketMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {createTicketMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("adminPages.studentDetail.sendAndOpenTicket", { defaultValue: "Send & open ticket" })}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

export default InstructorDetail;
