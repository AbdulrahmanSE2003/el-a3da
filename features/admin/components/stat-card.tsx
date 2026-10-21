import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  detail?: string
  tone?: "default" | "warn"
}

/** بطاقة إحصائية مضغوطة — بلا زخرفة، رقم كبير + تفصيل صغير */
export function StatCard({
  label,
  value,
  icon: Icon,
  detail,
  tone = "default",
}: StatCardProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-2 border-ink bg-paper-warm px-4 py-3.5">
      <div className="min-w-0 space-y-3">
        <p className="font-mono text-[10px] font-bold tracking-widest text-ink-soft">
          {label}
        </p>
        <p
          className={cn(
            "mt-1 text-2xl leading-none font-semibold tracking-tight",
            tone === "warn" ? "text-danger-brand" : "text-ink"
          )}
        >
          {value}
        </p>
        {detail && (
          <p className="mt-0.5 truncate text-xs font-medium text-ink-soft/80">
            {detail}
          </p>
        )}
      </div>

      <span
        className={cn(
          "icon-box shrink-0",
          tone === "warn"
            ? "border-danger-brand/30 bg-danger-brand/10 text-danger-brand"
            : "text-copper"
        )}
      >
        <Icon className="size-4" />
      </span>
    </div>
  )
}
