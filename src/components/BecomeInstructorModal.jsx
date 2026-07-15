import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Award, Briefcase, GraduationCap, Link2, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import client from "../api/client";
import { getErrorMessage } from "../api/error";
import useAuthStore from "../store/authStore";

const inputFieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#EE7C11] dark:focus:ring-[#EE7C11]/10";

const textAreaClass =
  "w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#EE7C11] dark:focus:ring-[#EE7C11]/10";

export default function BecomeInstructorModal({ onClose }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [cvUrl, setCvUrl] = useState("");

  // Auto-fill logged in user info
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !specialty.trim() || !bio.trim()) {
      toast.error(isRtl ? "يرجى ملء الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    
    // Construct structured message for admin review
    const structuredMessage = `
--- INSTRUCTOR APPLICATION SUBMISSION ---
Applicant Name: ${fullName.trim()}
Applicant Email: ${email.trim()}
Phone / WhatsApp: ${phone.trim() || "Not provided"}
Specialty / Field: ${specialty.trim()}
Years of Experience: ${experience.trim() || "Not specified"}
CV / Portfolio Link: ${cvUrl.trim() || "Not provided"}

Bio / Motivation:
${bio.trim()}
    `.trim();

    try {
      await client.post("/public/contact", {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        subject: `INSTRUCTOR_APPLICATION: [${specialty.trim()}]`,
        message: structuredMessage,
      });

      toast.success(
        isRtl
          ? "تم إرسال طلبك بنجاح! سنقوم بمراجعته والتواصل معك قريباً ✅"
          : "Your application has been submitted successfully! We will review it and contact you soon ✅"
      );
      onClose();
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          isRtl ? "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً." : "Failed to submit application. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl dark:border-slate-700/50 dark:bg-[#1E293B]"
          style={{ maxHeight: "95vh" }}
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#EE7C11] to-orange-500 p-6">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute rounded-full border border-white w-48 h-48 -top-12 -right-12" />
            </div>
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold leading-snug text-white flex items-center gap-2">
                  <GraduationCap className="h-6 w-6" />
                  {isRtl ? "انضم إلينا كمحاضر" : "Join Us as an Instructor"}
                </h2>
                <p className="mt-1.5 text-xs text-orange-100">
                  {isRtl
                    ? "قدّم طلب الانضمام إلى نخبة مهندسي منصة رواد الهندسة."
                    : "Apply to join the elite engineering instructors at Engineering Pioneers."}
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-xl bg-white/20 p-2 text-white transition hover:bg-white/30 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(95vh - 120px)" }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                    {isRtl ? "الاسم الكامل" : "Full Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputFieldClass}
                    placeholder={isRtl ? "مثال: م. أحمد محمد" : "e.g. Eng. Ahmed Mohamed"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                    {isRtl ? "البريد الإلكتروني" : "Email Address"} *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputFieldClass}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Specialty & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                    {isRtl ? "التخصص الهندسي" : "Engineering Specialty"} *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className={inputFieldClass}
                    placeholder={isRtl ? "مثال: هندسة برمجيات / ميكانيكا" : "e.g. Software / Mechanical"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                    {isRtl ? "الهاتف / الواتساب" : "Phone / WhatsApp"}
                  </label>
                  <input
                    type="tel"
                    disabled={loading}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputFieldClass}
                    placeholder="01xxxxxxxxx"
                  />
                </div>
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                  {isRtl ? "سنوات الخبرة" : "Years of Experience"}
                </label>
                <input
                  type="text"
                  disabled={loading}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className={inputFieldClass}
                  placeholder={isRtl ? "مثال: 5 سنوات" : "e.g. 5 Years"}
                />
              </div>

              {/* CV Url */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                  {isRtl ? "رابط السيرة الذاتية / معرض الأعمال" : "CV / Portfolio Link"}
                </label>
                <div className="relative">
                  <Link2 className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    disabled={loading}
                    value={cvUrl}
                    onChange={(e) => setCvUrl(e.target.value)}
                    className={`${inputFieldClass} ps-9`}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </div>

              {/* Bio & Motivation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                  {isRtl ? "لماذا تريد الانضمام إلينا؟ (نبذة عن خبرتك ومؤهلاتك)" : "Why do you want to join us? (Brief bio & skills)"} *
                </label>
                <textarea
                  rows={4}
                  required
                  disabled={loading}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={textAreaClass}
                  placeholder={isRtl ? "تحدث باختصار عن خبرتك العملية والأكاديمية..." : "Describe your professional and academic background..."}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-700/50">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-[#EE7C11] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition hover:bg-orange-600 active:scale-95 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isRtl ? "إرسال الطلب" : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
