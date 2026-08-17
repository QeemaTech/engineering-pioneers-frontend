import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, Clock3, ExternalLink, GraduationCap, Loader2, Radio, User, Video } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { fetchLiveSessionDetails } from "../../features/student/financials/api";
import { formatSessionWhen, useSessionTiming, splitCountdown, pad2 } from "../../components/student/liveSessionTiming";
import { getErrorMessage } from "../../api/error";
import useAuthStore from "../../store/authStore";
import StudentSessionSurveyModal from "../../components/student/StudentSessionSurveyModal";

export default function LiveSessionDetails() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const student = useAuthStore((s) => s.user);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyFired, setSurveyFired] = useState(false);

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchLiveSessionDetails(id);
      setSession(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load live session details"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  // Auto-fire survey modal when the session ends and student had access
  useEffect(() => {
    if (phase === "ended" && session?.canJoin && !surveyFired) {
      setSurveyFired(true);
      setTimeout(() => setSurveyOpen(true), 800);
    }
  }, [phase, session, surveyFired]);

  // Timing hooks
  const scheduledAt = session?.startTime;
  const durationMinutes = session
    ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
    : 0;

  const { phase, msLeft } = useSessionTiming(scheduledAt, durationMinutes);
  const parts = splitCountdown(msLeft);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Video className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          {isRtl ? "لم يتم العثور على الحصة" : "Session Not Found"}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{error || "This live session does not exist."}</p>
        <Link to="/student/live-sessions" className="mt-6 inline-block font-semibold text-pioneer-orange-normal hover:underline">
          {isRtl ? "العودة للحصص المباشرة" : "Back to Live Sessions"}
        </Link>
      </div>
    );
  }

  const canJoin = Boolean(session.canJoin);
  const canCheckout = Boolean(session.canCheckout);
  const pending = session.paymentStatus === "PENDING";
  const whenLabel = session.startTime ? formatSessionWhen(session.startTime, i18n.language) : "";

  return (
    <>
    <div className="mx-auto max-w-4xl space-y-6">
      <nav className="text-sm text-slate-500">
        <Link to="/student/live-sessions" className="font-medium text-pioneer-orange-normal hover:underline">
          {isRtl ? "الحصص المباشرة" : "Live Sessions"}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">{session.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {session.course && (
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {session.course.title}
                </span>
              )}
              {session.accessModel === "PUBLIC_FREE" || session.isFreeForAll ? (
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                  {isRtl ? "مفتوح مجاني" : "Public free"}
                </span>
              ) : session.accessModel === "TARGETED_FREE" ? (
                <span className="rounded-full bg-sky-700 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                  {isRtl ? "مجاني لسنتك الدراسية" : "Free for your year"}
                </span>
              ) : (
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  {isRtl ? `حصة مدفوعة (${Math.round(session.price || 0)} ج.م)` : `Paid Session (${Math.round(session.price || 0)} EGP)`}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">{session.title}</h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {session.description || (isRtl ? "لا يوجد وصف متوفر لهذه الحصة." : "No description provided for this session.")}
            </p>

            {/* Session details list */}
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:grid-cols-2">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <CalendarDays className="h-5 w-5 text-pioneer-orange-normal" />
                <div>
                  <p className="text-xs text-slate-400">{isRtl ? "التاريخ والوقت" : "Date & Time"}</p>
                  <p className="text-sm font-semibold">{whenLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Clock3 className="h-5 w-5 text-pioneer-orange-normal" />
                <div>
                  <p className="text-xs text-slate-400">{isRtl ? "المدة المقدرة" : "Estimated Duration"}</p>
                  <p className="text-sm font-semibold">{durationMinutes} {isRtl ? "دقيقة" : "Minutes"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructor section */}
          {session.instructor && (
            <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-pioneer-orange-normal" />
                {isRtl ? "معلومات المحاضر" : "Instructor Information"}
              </h2>
              <div className="flex items-start gap-4">
                {session.instructor.avatar ? (
                  <img
                    src={session.instructor.avatar}
                    alt={session.instructor.fullName}
                    className="h-16 w-16 rounded-2xl object-cover border border-slate-100 dark:border-slate-800"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <User className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">{session.instructor.fullName}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {session.instructor.bio || (isRtl ? "محاضر هندسي متخصص بالمنصة." : "Specialized engineering instructor.")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Booking / Joining Panel */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
            <h2 className="text-md font-bold text-slate-900 dark:text-white mb-4">
              {isRtl ? "حالة الانضمام" : "Access & Joining"}
            </h2>

            {/* Target Level Info */}
            {session.targetLevels && Array.isArray(session.targetLevels) && session.targetLevels.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {isRtl ? "المستوى المستهدف" : "Target Audience"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {session.targetLevels.map((lvl) => (
                    <span
                      key={lvl}
                      className="rounded-lg bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      {lvl === "PREPARATORY" ? (isRtl ? "إعدادي هندسة" : "Prep Year") :
                       lvl === "FIRST_YEAR" ? (isRtl ? "الفرقة الأولى" : "Year 1") :
                       lvl === "SECOND_YEAR" ? (isRtl ? "الفرقة الثانية" : "Year 2") :
                       lvl === "THIRD_YEAR" ? (isRtl ? "الفرقة الثالثة" : "Year 3") :
                       lvl === "FOURTH_YEAR" ? (isRtl ? "الفرقة الرابعة" : "Year 4") :
                       lvl === "GRADUATE" ? (isRtl ? "خريج" : "Graduate") : lvl}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Countdown block */}
            <div className="mb-6 border-t border-slate-100 pt-4 dark:border-slate-800">
              {phase === "live" && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold mb-3 justify-center">
                  <Radio className="h-4 w-4 animate-pulse" />
                  <span>{isRtl ? "البث المباشر فعال الآن!" : "Session is live!"}</span>
                </div>
              )}
              {phase === "ended" ? (
                <p className="text-center text-sm font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800 py-3 rounded-xl">
                  {isRtl ? "انتهى هذا البث" : "This session has ended"}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-center text-xs text-slate-400 font-bold tracking-wide uppercase">
                    {phase === "live" ? (isRtl ? "ينتهي البث المباشر خلال" : "Ends in") : (isRtl ? "يبدأ البث المباشر خلال" : "Starts in")}
                  </p>
                  <div className="flex justify-center gap-2">
                    {parts.days > 0 && (
                      <div className="text-center bg-slate-50 dark:bg-slate-800 p-2 rounded-lg min-w-[3rem]">
                        <p className="text-lg font-extrabold text-pioneer-orange-normal">{pad2(parts.days)}</p>
                        <p className="text-[9px] text-slate-400">{isRtl ? "يوم" : "Day"}</p>
                      </div>
                    )}
                    <div className="text-center bg-slate-50 dark:bg-slate-800 p-2 rounded-lg min-w-[3rem]">
                      <p className="text-lg font-extrabold text-pioneer-orange-normal">{pad2(parts.hours)}</p>
                      <p className="text-[9px] text-slate-400">{isRtl ? "ساعة" : "Hrs"}</p>
                    </div>
                    <div className="text-center bg-slate-50 dark:bg-slate-800 p-2 rounded-lg min-w-[3rem]">
                      <p className="text-lg font-extrabold text-pioneer-orange-normal">{pad2(parts.minutes)}</p>
                      <p className="text-[9px] text-slate-400">{isRtl ? "دقيقة" : "Min"}</p>
                    </div>
                    <div className="text-center bg-slate-50 dark:bg-slate-800 p-2 rounded-lg min-w-[3rem]">
                      <p className="text-lg font-extrabold text-pioneer-orange-normal">{pad2(parts.seconds)}</p>
                      <p className="text-[9px] text-slate-400">{isRtl ? "ثانية" : "Sec"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action booking vs joining */}
            {pending ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200/50 p-4 text-center">
                <p className="text-sm font-semibold text-amber-800">
                  {isRtl ? "تم إرسال إثبات الدفع. بانتظار مراجعة الأدمن قبل الانضمام." : "Proof submitted. Wait for Super Admin review before you can join."}
                </p>
                <Link to="/student/payments" className="mt-3 inline-block text-sm font-bold text-pioneer-orange-normal hover:underline">
                  {isRtl ? "متابعة المدفوعات" : "Track payment"}
                </Link>
              </div>
            ) : canCheckout ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-amber-50 dark:bg-amber-955/20 border border-amber-200/50 p-4 text-center">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {isRtl ? "يمكنك معاينة هذه الحصة. الانضمام بعد تأكيد الدفع." : "Preview this session. Join after payment is approved."}
                  </p>
                </div>
                <Link
                  to={`/student/checkout?liveSessionId=${session.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal hover:bg-pioneer-orange-hover py-3 text-sm font-bold text-white transition shadow-md"
                >
                  <span>🎟️</span>
                  <span>{isRtl ? `احجز مقعدك (${Math.round(session.price || 0)} ج.م)` : `Book Seat (${Math.round(session.price || 0)} EGP)`}</span>
                </Link>
              </div>
            ) : canJoin ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 p-4 text-center">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    {isRtl ? "أنت مسجل في هذا البث بنجاح! ✅" : "You have successfully booked access! ✅"}
                  </p>
                </div>
                {session.meetingUrl ? (
                  <a
                    href={session.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white transition shadow-md"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>{isRtl ? "انضم للبث المباشر الآن" : "Join Live Stream Now"}</span>
                  </a>
                ) : (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-center border border-slate-200 dark:border-slate-700/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isRtl ? "سيظهر رابط البث المباشر هنا فور بدئه." : "Meeting link will appear here once active."}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>

    {/* Post-session survey modal */}
    {surveyOpen && session && (
      <StudentSessionSurveyModal
        sessionId={session.id}
        sessionTitle={session.title}
        onClose={() => setSurveyOpen(false)}
      />
    )}
  </>
  );
}
