function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, className = "" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/8 dark:bg-[#1A1A22] ${className}`}>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:text-slate-300">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-[#EE7C11] px-3 py-2 text-sm font-bold text-white">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;

