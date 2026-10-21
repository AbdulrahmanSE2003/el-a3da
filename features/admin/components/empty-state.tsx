import type { LucideIcon } from "lucide-react"
import { InboxIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
}

/** حالة فاضية — موحدة لكل الصفحات */
export function EmptyState({ icon: Icon = InboxIcon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-ink/20 bg-paper-warm/50 px-6 py-14 text-center">
      <span className="icon-box text-ink-soft/60">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-bold text-ink">{title}</p>
      {description && (
        <p className="max-w-sm text-xs leading-relaxed text-ink-soft">
          {description}
        </p>
      )}
    </div>
  )
}
