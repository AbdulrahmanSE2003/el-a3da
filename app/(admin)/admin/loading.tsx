export default function AdminLoading() {
  return (
    <div
      className="flex flex-col gap-4 sm:gap-5"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="border-b-2 border-ink pb-4 sm:pb-5">
        <div className="h-3 w-20 animate-pulse bg-ink/10 sm:w-24" />
        <div className="mt-3 h-7 w-40 animate-pulse bg-ink/10 sm:h-9 sm:w-56" />
        <div className="mt-3 h-3 w-full max-w-xl animate-pulse bg-ink/10" />
        <div className="mt-2 h-3 w-3/4 max-w-md animate-pulse bg-ink/10" />
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex h-20 flex-col justify-between border-2 border-ink/20 bg-paper-warm p-3 sm:h-24"
          >
            <div className="h-3 w-12 animate-pulse bg-ink/10" />
            <div className="h-6 w-16 animate-pulse bg-ink/10" />
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse border-2 border-ink/20 bg-paper-warm"
          />
        ))}
      </div>

      <div className="h-48 animate-pulse border-2 border-ink/20 bg-paper-warm sm:h-72" />

      <div className="flex items-center justify-center gap-2">
        <span className="size-2 animate-pulse rounded-full bg-copper" />
        <p className="text-center text-xs font-bold text-ink-soft">
          بيتم تحميل بيانات لوحة المطوّر...
        </p>
      </div>
    </div>
  )
}
