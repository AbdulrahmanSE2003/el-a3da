import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"
import { PageHeader } from "./page-header"
import { Tag, AdminTable, AdminTHead, AdminTR, AdminTH, AdminTD } from "./table"
import { EmptyState } from "./empty-state"
import { formatNumber } from "../lib/format"
import {
  SEVERITY_CLASS,
  SEVERITY_ICON,
  SEVERITY_LABELS,
  type FindingSeverity,
  type HealthReport,
} from "../lib/types"

const SEVERITY_ORDER: Record<FindingSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

/** فحص حقيقي على جداول المحتوى — كل الأرقام من Neon، مفيش findings تجريبية. */
export function HealthView({ report }: { report: HealthReport }) {
  const findings = [...report.findings].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  )

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        stamp="HEALTH"
        title="صحة المحتوى"
        description="فحص قراءة فقط على questions و content_sets. النتائج محسوبة من قاعدة البيانات الحالية، ومفيش أي تعديل بيتم من هنا."
        action={
          <Tag className="border-ink/20 bg-ink/5 font-mono text-ink-soft">
            READ ONLY
          </Tag>
        }
      />

      <div className="grid grid-cols-3 gap-2">
        {(["critical", "warning", "info"] as FindingSeverity[]).map((key) => {
          const Icon = SEVERITY_ICON[key]
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-2 border-2 border-ink bg-paper-warm px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-ink-soft" />
                <span className="text-xs font-bold">
                  {SEVERITY_LABELS[key]}
                </span>
              </div>
              <span className="font-mono text-xl font-black">
                {formatNumber(report.severityCounts[key])}
              </span>
            </div>
          )
        })}
      </div>

      <section className="border-2 border-ink bg-paper-warm">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-4 py-2.5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-black">ملخص المجموعات</h2>
            <span className="stamp-text">SETS</span>
          </div>
          <p className="text-[11px] text-ink-soft/70">
            {formatNumber(report.totals.live)} حي ·{" "}
            {formatNumber(report.totals.deleted)} محذوف
          </p>
        </header>

        <AdminTable>
          <AdminTHead>
            <tr>
              <AdminTH>المجموعة</AdminTH>
              <AdminTH className="text-center">حي</AdminTH>
              <AdminTH className="text-center">محذوف</AdminTH>
              <AdminTH className="text-center">نسخة</AdminTH>
              <AdminTH className="text-center">فئة ناقصة</AdminTH>
              <AdminTH className="text-center">إجابة ناقصة</AdminTH>
              <AdminTH className="text-center">شارة ناقصة</AdminTH>
              <AdminTH className="text-center">ترتيب</AdminTH>
              <AdminTH className="text-center">نص مكرر</AdminTH>
            </tr>
          </AdminTHead>
          <tbody>
            {report.sets.map((set) => (
              <AdminTR key={set.id}>
                <AdminTD>
                  <Link
                    href={`/admin/questions?set=${set.id}`}
                    className="font-bold text-ink underline-offset-4 hover:text-copper hover:underline"
                  >
                    {set.title}
                  </Link>
                  <p className="mt-0.5 font-mono text-[10px] text-ink-soft/60">
                    {set.stamp}
                  </p>
                </AdminTD>
                <AdminTD className="text-center font-mono text-xs">
                  {formatNumber(set.liveCount)}
                </AdminTD>
                <AdminTD className="text-center font-mono text-xs">
                  {formatNumber(set.deletedCount)}
                </AdminTD>
                <AdminTD className="text-center font-mono text-xs text-copper">
                  {set.version}
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
                  {set.duplicatePositions > 0
                    ? `${formatNumber(set.duplicatePositions)} مكرر`
                    : set.positionGaps > 0
                      ? `${formatNumber(set.positionGaps)} فراغ`
                      : "سليم"}
                </AdminTD>
                <AdminTD className="text-center font-mono text-xs">
                  {set.duplicateTextGroups > 0
                    ? `${formatNumber(set.duplicateTextGroups)} / ${formatNumber(
                        set.duplicateTextRecords
                      )}`
                    : "—"}
                </AdminTD>
              </AdminTR>
            ))}
          </tbody>
        </AdminTable>
      </section>

      <div className="border-2 border-ink bg-paper-warm">
        <div className="flex items-center justify-between border-b border-ink/10 px-4 py-2">
          <p className="font-mono text-[10px] font-bold tracking-widest text-ink-soft">
            FINDINGS · {formatNumber(findings.length)}
          </p>
          <p className="text-[11px] text-ink-soft/70">الأخطر الأول</p>
        </div>

        {findings.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="كل الفحوصات سليمة"
              description="مفيش مشاكل محتوى ظاهرة في الجداول الحالية."
            />
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {findings.map((finding) => {
              const Icon = SEVERITY_ICON[finding.severity]
              return (
                <li
                  key={finding.id}
                  className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-copper/5"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Icon className="size-4 text-ink-soft" />
                    <span className="text-sm font-bold text-ink">
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
                      className="inline-flex w-fit items-center gap-1 text-[11px] font-bold text-copper underline-offset-4 hover:underline"
                    >
                      عرض المجموعة
                      <ExternalLinkIcon className="size-3.5" />
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <p className="border-2 border-dashed border-ink/20 px-3 py-2 text-[11px] leading-relaxed text-ink-soft/80">
        ملاحظة: تكرار النصوص في بعض المجموعات جزء من المصدر الأصلي واتحفظ زي
        ما هو. الفحص بيظهره كمعلومة، مش كخطأ، ومش بيعمل أي تعديل أو دمج.
      </p>
    </div>
  )
}
