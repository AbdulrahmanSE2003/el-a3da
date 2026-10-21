"use client"

import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-4 border-2 border-ink bg-paper-warm p-8 text-center shadow-[6px_6px_0_var(--color-ink)]">
      <div className="flex size-14 items-center justify-center border-2 border-ink bg-danger-brand/10 text-danger-brand shadow-[3px_3px_0_var(--color-ink)]">
        <AlertTriangleIcon className="size-7" />
      </div>

      <div className="max-w-md">
        <span className="stamp-text text-danger-brand">SYSTEM ERROR</span>
        <h2 className="mt-1 text-xl font-black text-ink">حدث خطأ غير متوقع</h2>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          تعذر تحميل البيانات أو إكمال العملية المطلوبة. يمكنك المحاولة مرة
          أخرى.
        </p>

        {error?.message && (
          <div className="mt-3 overflow-x-auto border border-ink/20 bg-paper px-3 py-2 text-start font-mono text-[11px] text-danger-brand">
            {error.message}
          </div>
        )}
      </div>

      <button
        onClick={reset}
        className="mt-2 inline-flex items-center gap-2 border-2 border-ink bg-danger-brand px-4 py-2 text-xs font-bold text-paper shadow-[3px_3px_0_var(--color-ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        <RotateCcwIcon className="size-4" />
        إعادة المحاولة
      </button>
    </div>
  )
}
