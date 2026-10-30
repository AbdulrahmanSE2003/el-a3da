import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"
import { Tag } from "../components/table"
import { EmptyState } from "../components/empty-state"
import { formatNumber } from "../lib/format"
import {
  SEVERITY_CLASS,
  SEVERITY_ICON,
  SEVERITY_LABELS,
  type FindingSeverity,
  type HealthFinding,
} from "../lib/types"

const SEVERITY_ORDER: Record<FindingSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

interface HealthFindingsListProps {
  findings: HealthFinding[]
}

export function HealthFindingsList({ findings }: HealthFindingsListProps) {
  const sortedFindings = [...findings].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  )

  return (
    <div className="border-2 border-ink bg-paper-warm shadow-[4px_4px_0_var(--color-ink)]">
      <div className="flex items-center justify-between border-b border-ink/10 bg-paper-warm/40 px-4 py-2.5">
        <p className="font-mono text-[10px] font-bold tracking-widest text-ink-soft uppercase">
          نتائج الفحص التفصيلي · {formatNumber(sortedFindings.length)}
        </p>
        <span className="text-xs font-medium text-ink-soft/80">
          مرتبة حسب درجة الأهمية
        </span>
      </div>

      {sortedFindings.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="كل حاجة تمام"
            description="مفيش أي ملاحظات على جودة البيانات دلوقتي."
          />
        </div>
      ) : (
        <ul className="divide-y divide-ink/10">
          {sortedFindings.map((finding) => {
            const Icon = SEVERITY_ICON[finding.severity]
            return (
              <li
                key={finding.id}
                className="flex flex-col gap-2 p-4 transition-colors hover:bg-paper-warm/60"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Icon className="size-4 shrink-0 text-ink-soft" />
                  <span className="text-sm font-bold text-foreground">
                    {finding.title}
                  </span>
                  <Tag className={SEVERITY_CLASS[finding.severity]}>
                    {SEVERITY_LABELS[finding.severity]}
                  </Tag>
                  {finding.count !== undefined && (
                    <Tag className="border-ink/20 bg-ink/5 font-mono text-ink-soft">
                      {formatNumber(finding.count)}
                    </Tag>
                  )}
                </div>

                <p className="text-xs leading-relaxed text-ink-soft">
                  {finding.description}
                </p>

                {finding.setId && (
                  <Link
                    href={`/admin/questions?set=${finding.setId}`}
                    className="mt-1 inline-flex w-fit items-center gap-1.5 text-xs font-bold text-copper transition-opacity hover:opacity-80"
                  >
                    عرض أسئلة المجموعة
                    <ExternalLinkIcon className="size-3.5" />
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
