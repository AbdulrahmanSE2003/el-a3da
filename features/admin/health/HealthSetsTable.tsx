import Link from "next/link"
import {
  AdminTable,
  AdminTHead,
  AdminTR,
  AdminTH,
  AdminTD,
} from "../components/table"
import { formatNumber } from "../lib/format"
import type { HealthReport } from "../lib/types"

interface HealthSetsTableProps {
  sets: HealthReport["sets"]
  totals: HealthReport["totals"]
}

export function HealthSetsTable({ sets, totals }: HealthSetsTableProps) {
  return (
    <section className="border-2 border-ink bg-paper-warm shadow-[4px_4px_0_var(--color-ink)]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-paper-warm/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black text-foreground">ملخص المجموعات</h2>
          <span className="stamp-text">SETS SUMMARY</span>
        </div>
        <p className="text-xs font-medium text-ink-soft">
          إجمالي النشط:{" "}
          <strong className="text-foreground">
            {formatNumber(totals.live)}
          </strong>{" "}
          · المؤرشف:{" "}
          <strong className="text-foreground">
            {formatNumber(totals.deleted)}
          </strong>
        </p>
      </header>

      <AdminTable>
        <AdminTHead>
          <tr>
            <AdminTH>المجموعة</AdminTH>
            <AdminTH className="text-center">النشط</AdminTH>
            <AdminTH className="text-center">المؤرشف</AdminTH>
            <AdminTH className="text-center">الإصدار</AdminTH>
            <AdminTH className="text-center">فئة مفقودة</AdminTH>
            <AdminTH className="text-center">إجابة مفقودة</AdminTH>
            <AdminTH className="text-center">شارة مفقودة</AdminTH>
            <AdminTH className="text-center">سلامة التسلسل</AdminTH>
            <AdminTH className="text-center">تكرار النصوص</AdminTH>
          </tr>
        </AdminTHead>
        <tbody>
          {sets.map((set) => (
            <AdminTR
              key={set.id}
              className="transition-colors hover:bg-paper-warm/60"
            >
              <AdminTD>
                <Link
                  href={`/admin/questions?set=${set.id}`}
                  className="font-bold text-foreground transition-colors hover:text-copper"
                >
                  {set.title}
                </Link>
                <p className="mt-0.5 font-mono text-[10px] text-ink-soft/70">
                  {set.stamp}
                </p>
              </AdminTD>
              <AdminTD className="text-center font-mono text-xs font-bold">
                {formatNumber(set.liveCount)}
              </AdminTD>
              <AdminTD className="text-center font-mono text-xs text-ink-soft">
                {formatNumber(set.deletedCount)}
              </AdminTD>
              <AdminTD className="text-center font-mono text-xs font-bold text-copper">
                v{set.version}
              </AdminTD>
              <AdminTD className="text-center font-mono text-xs">
                {formatNumber(set.missingCategory)}
              </AdminTD>
              <AdminTD className="text-center font-mono text-xs">
                {formatNumber(set.missingCorrectAnswer)}
              </AdminTD>
              <AdminTD className="text-center font-mono text-xs">
                {formatNumber(set.missingBadgeLabel)}
              </AdminTD>
              <AdminTD className="text-center font-mono text-xs">
                {set.duplicatePositions > 0 ? (
                  <span className="font-bold text-danger-brand">
                    {formatNumber(set.duplicatePositions)} مكرر
                  </span>
                ) : set.positionGaps > 0 ? (
                  <span className="font-medium text-copper">
                    {formatNumber(set.positionGaps)} فجوة
                  </span>
                ) : (
                  <span className="text-ink-soft/60">سليم</span>
                )}
              </AdminTD>
              <AdminTD className="text-center font-mono text-xs">
                {set.duplicateTextGroups > 0 ? (
                  <span className="font-medium">
                    {formatNumber(set.duplicateTextGroups)} فئات (
                    {formatNumber(set.duplicateTextRecords)} سجل)
                  </span>
                ) : (
                  <span className="text-ink-soft/40">—</span>
                )}
              </AdminTD>
            </AdminTR>
          ))}
        </tbody>
      </AdminTable>
    </section>
  )
}
