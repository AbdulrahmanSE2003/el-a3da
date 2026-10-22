interface PageHeaderProps {
  stamp: string
  title: string
  description?: string
  action?: React.ReactNode
}

/** ترويسة الصفحة — بنفس نمط صفحات التطبيق (stamp + عنوان أسود) */
export function PageHeader({
  stamp,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-5">
      <div>
        <p className="stamp-text">{stamp}</p>
        <h1 className="mt-2 text-3xl leading-tight font-black md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {description}
          </p>
        )}
      </div>

      {action && <div className="flex items-center gap-2">{action}</div>}
    </header>
  )
}
