function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-widest text-pioneer-orange-normal">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">{title}</h1>
        {subtitle ? (
          <p className="max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}


export default PageHeader;

