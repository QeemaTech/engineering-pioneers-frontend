import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import SlideOver from "../../components/ui/SlideOver";
import StatusBadge from "../../components/ui/StatusBadge";

const integrations = [
  { name: "Stripe", desc: "Payments", connected: true },
  { name: "Mailchimp", desc: "Email", connected: false },
  { name: "Google Analytics", desc: "Tracking", connected: true },
  { name: "Zoom", desc: "Live Classes", connected: false },
  { name: "AWS S3", desc: "Storage", connected: true },
  { name: "Twilio", desc: "SMS", connected: false },
];

function SettingsIntegrations() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  return (
    <section className="space-y-6">
      <PageHeader title={t("adminPages.settingsIntegrations.title")} subtitle={t("adminPages.settingsIntegrations.subtitle")} />
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-white/8 dark:bg-[#1A1A22] dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-white">{t("adminPages.settingsIntegrations.webhookGuideTitle", "Webhook setup guide")}</p>
        <p className="mt-1">{t("adminPages.settingsIntegrations.webhookGuideBody", "Configure provider webhooks to point to /api/v1/webhooks/payments/:provider and validate signatures in provider dashboards.")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((it) => (
          <div key={it.name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-white/10 dark:text-white">{it.name[0]}</div>
              <StatusBadge label={it.connected ? t("adminPages.settingsIntegrations.connected") : t("adminPages.settingsIntegrations.disconnected")} tone={it.connected ? "success" : "neutral"} />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">{it.name}</p>
            <p className="text-xs text-slate-500">{it.desc}</p>
            <button onClick={() => setSelected(it)} className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:text-slate-300">{t("adminPages.settingsIntegrations.configure")}</button>
          </div>
        ))}
      </div>
      <SlideOver open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name || ""}>
        <div className="space-y-3">
          <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" placeholder="API Key" />
          <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" placeholder="Webhook URL" />
          <button className="rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white">{t("adminPages.settingsIntegrations.testConnection")}</button>
        </div>
      </SlideOver>
    </section>
  );
}

export default SettingsIntegrations;

