import { PageHeader } from "./page-header"
import { Tag } from "./table"
import { HealthSeverityCards } from "../health/HealthSeverityCards"
import { HealthSetsTable } from "../health/HealthSetsTable"
import { HealthFindingsList } from "../health/HealthFindingsList"
import type { HealthReport } from "../lib/types"

export function HealthView({ report }: { report: HealthReport }) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        stamp="HEALTH CHECK"
        title="صحة المحتوى"
        description="مراجعة سريعة لجودة الأسئلة والمجموعات، عشان تمسك أي مشكلة قبل ما توصل للاعبين."
        action={
          <Tag className="border-ink/20 bg-ink/5 font-mono text-xs font-bold text-ink-soft">
            وضع القراءة فقط
          </Tag>
        }
      />

      {/* Summary Stat Cards */}
      <HealthSeverityCards severityCounts={report.severityCounts} />

      {/* Summary Table for Content Sets */}
      <HealthSetsTable sets={report.sets} totals={report.totals} />

      {/* Findings List */}
      <HealthFindingsList findings={report.findings} />

      {/* Technical Footnote */}
      <p className="rounded-xs border-2 border-dashed border-ink/20 bg-paper-warm/30 p-3 text-xs leading-relaxed text-ink-soft">
        <strong className="font-bold text-foreground">تنويه:</strong> ممكن تلاقي
        نصوص مكررة لأنها موجودة كده في المصدر الأصلي. بنسجّلها للعلم بس، ومفيش
        حذف أو تعديل تلقائي.
      </p>
    </div>
  )
}
