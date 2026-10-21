export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      <div className="border-b-2 border-ink pb-5">
        <div className="h-3 w-24 animate-pulse bg-ink/10" />
        <div className="mt-3 h-9 w-56 animate-pulse bg-ink/10" />
        <div className="mt-3 h-3 w-full max-w-xl animate-pulse bg-ink/10" />
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse border-2 border-ink/20 bg-paper-warm"
          />
        ))}
      </div>

      <div className="h-72 animate-pulse border-2 border-ink/20 bg-paper-warm" />

      <p className="text-center text-xs font-bold text-ink-soft">
        بيتم تحميل بيانات لوحة المطوّر...
      </p>
    </div>
  )
}
