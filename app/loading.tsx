import { Loader2Icon } from "lucide-react"

interface LoadingProps {
  label?: string
}

export default function Loading({
  label = "جاري تحميل البيانات...",
}: LoadingProps) {
  return (
    <div className="flex min-h-75 w-full flex-col items-center justify-center gap-3 rounded-none border-2 border-ink bg-paper-warm p-8 text-center shadow-[4px_4px_0_var(--color-ink)]">
      <div className="flex size-12 items-center justify-center border-2 border-ink bg-copper/20 text-copper shadow-[2px_2px_0_var(--color-ink)]">
        <Loader2Icon className="size-6 animate-spin" />
      </div>
      <p className="font-mono text-xs font-bold text-ink">{label}</p>
    </div>
  )
}
