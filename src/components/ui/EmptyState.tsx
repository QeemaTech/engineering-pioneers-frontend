function EmptyState({ title, message, cta = null, className = "" }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-white/8 dark:bg-[#1A1A22] ${className}`}>
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-red-100/70 dark:bg-[#EE7C11]/10" />
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {cta ? <div className="mt-4">{cta}</div> : null}
    </div>
  );
}

export default EmptyState;

