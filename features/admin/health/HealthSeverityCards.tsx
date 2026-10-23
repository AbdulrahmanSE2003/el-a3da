import { formatNumber } from "../lib/format"
import {
  SEVERITY_ICON,
  SEVERITY_LABELS,
  type FindingSeverity,
  type HealthReport,
} from "../lib/types"

interface HealthSeverityCardsProps {
  severityCounts: HealthReport["severityCounts"]
}

export function HealthSeverityCards({
  severityCounts,
}: HealthSeverityCardsProps) {
  const severities: FindingSeverity[] = ["critical", "warning", "info"]

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      {severities.map((key) => {
        const Icon = SEVERITY_ICON[key]
        return (
          <div
            key={key}
            className="flex items-center justify-between gap-3 border-2 border-ink bg-paper-warm p-3 shadow-[2px_2px_0_var(--color-ink)]"
          >
            <div className="flex items-center gap-2">
              <Icon className="size-4.5 shrink-0 text-ink-soft" />
              <span className="text-xs font-bold text-foreground">
                {SEVERITY_LABELS[key]}
              </span>
            </div>
            <span className="font-mono text-xl font-black text-foreground">
              {formatNumber(severityCounts[key])}
            </span>
          </div>
        )
      })}
    </div>
  )
}
