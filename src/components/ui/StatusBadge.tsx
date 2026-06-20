const toneClasses = {
  success: "bg-green-500/15 text-green-400 border border-green-500/20",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  danger: "bg-[#EE7C11]/15 text-red-400 border border-red-500/20",
  info: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  neutral: "bg-slate-500/15 text-slate-400 border border-slate-500/20",
  purple: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
};

function StatusBadge({ label, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${toneClasses[tone] || toneClasses.neutral} ${className}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;

