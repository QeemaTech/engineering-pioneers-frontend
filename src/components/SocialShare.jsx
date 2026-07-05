import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Share2, Link2, Check } from "lucide-react";
import toast from "react-hot-toast";

function SocialShare({ url, title }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url || window.location.href);
  const encodedTitle = encodeURIComponent(title || document.title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      toast.success(isRtl ? "تم نسخ الرابط بنجاح!" : "Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(isRtl ? "فشل نسخ الرابط" : "Failed to copy link.");
    }
  };

  const platforms = [
    {
      name: "Facebook",
      icon: () => (
        <svg className="h-4 w-4 fill-blue-600" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "bg-blue-50 hover:bg-blue-100/60 dark:bg-blue-500/10 dark:hover:bg-blue-500/20",
    },
    {
      name: "Twitter",
      icon: () => (
        <svg className="h-4 w-4 fill-slate-900 dark:fill-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10",
    },
    {
      name: "WhatsApp",
      icon: () => (
        <svg className="h-4 w-4 fill-emerald-500" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.141 1.233 8.377 3.469 2.235 2.237 3.465 5.212 3.464 8.377-.003 6.537-5.328 11.86-11.859 11.86-2.004-.001-3.973-.508-5.729-1.475L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.526 0 10.022-4.494 10.024-10.022.001-2.678-1.04-5.195-2.933-7.09C16.49 1.6 13.978.558 11.858.558c-5.529 0-10.025 4.495-10.027 10.023-.001 1.902.501 3.758 1.455 5.378L2.09 21.096l4.557-1.942z" />
        </svg>
      ),
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: "bg-emerald-50 hover:bg-emerald-100/60 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20",
    },
  ];

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 transition-all duration-300">
      <p className="text-xs font-bold text-slate-500 tracking-wide uppercase flex items-center gap-1.5">
        <Share2 className="h-3.5 w-3.5 text-[#EE7C11]" />
        {isRtl ? "مشاركة مع الأصدقاء" : "Share with friends"}
      </p>
      
      <div className="flex items-center gap-2 mt-1">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <a
              key={platform.name}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 dark:border-slate-800 transition-all ${platform.color}`}
              title={`Share on ${platform.name}`}
            >
              <Icon />
            </a>
          );
        })}
        
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all"
          title={isRtl ? "نسخ الرابط" : "Copy Link"}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Link2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default SocialShare;
