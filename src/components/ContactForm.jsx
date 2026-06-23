import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Send } from "lucide-react";
import client from "../api/client";
import { getErrorMessage } from "../api/error";

const field =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/15";

export default function ContactForm() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await client.post("/public/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setForm({ name: "", email: "", subject: "", message: "" });
      setStatus({ type: "success", message: t("publicContact.formSuccess", { defaultValue: isRtl ? "تم إرسال رسالتك. سنتواصل معك قريباً." : "Message sent. We will reply soon." }) });
    } catch (err) {
      setStatus({ type: "error", message: getErrorMessage(err, t("publicContact.formError", { defaultValue: isRtl ? "تعذّر الإرسال." : "Could not send message." })) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-lg font-extrabold text-slate-900">
        {t("publicContact.formTitle", { defaultValue: isRtl ? "أرسل رسالة" : "Send us a message" })}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {t("publicContact.formSubtitle", { defaultValue: isRtl ? "املأ النموذج وسيرد فريقنا عليك." : "Fill in the form and our team will respond." })}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("publicContact.nameLabel", { defaultValue: isRtl ? "الاسم" : "Name" })}
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={field}
            dir={isRtl ? "rtl" : "ltr"}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("publicContact.emailLabel", { defaultValue: isRtl ? "البريد الإلكتروني" : "Email" })}
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className={field}
            dir="ltr"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("publicContact.subjectLabel", { defaultValue: isRtl ? "الموضوع" : "Subject" })}
          </label>
          <input
            value={form.subject}
            onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            className={field}
            dir={isRtl ? "rtl" : "ltr"}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("publicContact.messageLabel", { defaultValue: isRtl ? "الرسالة" : "Message" })}
          </label>
          <textarea
            required
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            className={`${field} min-h-32 py-3`}
            dir={isRtl ? "rtl" : "ltr"}
          />
        </div>
      </div>

      {status ? (
        <p className={`mt-4 text-sm font-medium ${status.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
          {status.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#EE7C11] px-6 text-sm font-bold text-white transition hover:bg-[#d9700e] disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {t("publicContact.submit", { defaultValue: isRtl ? "إرسال" : "Send message" })}
      </button>
    </form>
  );
}
