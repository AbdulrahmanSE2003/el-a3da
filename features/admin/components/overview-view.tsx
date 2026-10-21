"use client"

import Link from "next/link"
import {
  ActivityIcon,
  ArrowUpRightIcon,
  CalendarClockIcon,
  DatabaseIcon,
  ListChecksIcon,
  LockIcon,
  MessageSquareIcon,
  StickyNoteIcon,
  Trash2Icon,
} from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { PageHeader } from "./page-header"
import { StatCard } from "./stat-card"
import { Tag } from "./table"
import { EmptyState } from "./empty-state"
import {
  formatArabicTimeAgo,
  formatDateTime,
  formatNumber,
} from "../lib/format"
import type { ContentSetId, OverviewData } from "../lib/types"
import { cn } from "@/lib/utils"
import StatsGrid from "./overview/StatsGrid"

/** ألوان كل مجموعة في الـ pie — نفس لغة ألوان الواجهة */
const SET_COLORS: Record<ContentSetId, string> = {
  casino: "var(--color-copper)",
  topics: "var(--color-ink)",
  challenges: "var(--color-danger-brand)",
  sheikh: "var(--color-ink-glow)",
  zad: "var(--color-steam)",
  punishments: "#6B5A3E",
}

function Panel({
  title,
  stamp,
  action,
  children,
  className,
}: {
  title: string
  stamp?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("border-2 border-ink bg-paper-warm", className)}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-4 py-2.5">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-black text-ink">{title}</h2>
          {stamp && <span className="stamp-text">{stamp}</span>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

export function OverviewView({ data }: { data: OverviewData }) {
  const chartConfig: ChartConfig = Object.fromEntries(
    data.sets.map((set) => [
      set.id,
      { label: set.title, color: SET_COLORS[set.id] },
    ])
  )

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        stamp="لوحة التحكم"
        title="نظرة عامة"
        description="إحصائيات وقراءات مباشرة من قاعدة البيانات، للمتابعة والاطلاع فقط."
      />

      <StatsGrid data={data} />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Panel title="المحتوى حسب المجموعة" stamp="CONTENT">
          {data.totalLive === 0 ? (
            <div className="p-4">
              <EmptyState
                title="مفيش عناصر حية"
                description="جدول questions فاضي أو كل العناصر محذوفة."
              />
            </div>
          ) : (
            <div className="grid items-center gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_190px]">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-62.5 w-full"
              >
                <PieChart
                  data={data.sets.map((set) => ({
                    set: set.id,
                    total: set.liveCount,
                  }))}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent nameKey="set" hideLabel />}
                  />
                  <Pie
                    dataKey="total"
                    nameKey="set"
                    innerRadius={55}
                    outerRadius={95}
                    strokeWidth={2}
                    stroke="var(--color-ink)"
                    isAnimationActive={false}
                  >
                    {data.sets.map((set) => (
                      <Cell key={set.id} fill={SET_COLORS[set.id]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>

              <ul className="flex flex-col gap-1.5">
                {data.sets.map((set) => (
                  <li
                    key={set.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="size-2.5 shrink-0 rounded-[2px] border border-ink/20"
                        style={{ backgroundColor: SET_COLORS[set.id] }}
                      />
                      <span className="truncate text-xs font-bold">
                        {set.title}
                      </span>
                      {!set.isUsed && (
                        <Tag className="border-copper/40 bg-copper/10 text-[9px] text-copper">
                          غير مستخدم
                        </Tag>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] font-bold text-ink-soft">
                      {formatNumber(set.liveCount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-ink/10 px-4 py-2">
            <span className="text-[11px] text-ink-soft/70">
              العناصر الحية فقط — المحذوف معروض في جدول المجموعات.
            </span>
            <Link
              href="/admin/questions"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-copper underline-offset-4 hover:underline"
            >
              عرض الأسئلة
              <ArrowUpRightIcon className="size-3.5" />
            </Link>
          </div>
        </Panel>

        <Panel title="المجموعات والنسخ" stamp="VERSIONS">
          <ul className="divide-y divide-ink/10">
            {data.sets.map((set) => (
              <li
                key={set.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">{set.title}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-ink-soft/70">
                    {set.stamp} · {set.sourceFile}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-end">
                  <div>
                    <p className="font-mono text-xs font-black">
                      {formatNumber(set.liveCount)}
                    </p>
                    <p className="text-[9px] text-ink-soft/70">حي</p>
                  </div>
                  <div>
                    <p
                      className={cn(
                        "font-mono text-xs font-black",
                        set.deletedCount > 0
                          ? "text-danger-brand"
                          : "text-ink-soft/60"
                      )}
                    >
                      {formatNumber(set.deletedCount)}
                    </p>
                    <p className="text-[9px] text-ink-soft/70">محذوف</p>
                  </div>
                  <Tag className="border-copper/30 bg-copper/10 font-mono text-[10px] text-copper">
                    v{set.version}
                  </Tag>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Panel title="حالة اللوحة" stamp="STATUS">
          <dl className="divide-y divide-ink/10">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
              <dt className="flex items-center gap-1.5 text-xs font-bold">
                <DatabaseIcon className="size-4 text-copper" />
                قراءة المحتوى من Neon
              </dt>
              <dd className="font-mono text-[10px] font-bold text-copper">
                متصلة
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
              <dt className="flex items-center gap-1.5 text-xs font-bold">
                <LockIcon className="size-4 text-danger-brand" />
                مصادقة المسؤول
              </dt>
              <dd className="font-mono text-[10px] font-bold text-danger-brand">
                غير مفعّلة
              </dd>
            </div>
            <div className="px-4 py-2.5">
              <dt className="text-xs font-bold">الكتابة</dt>
              <dd className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                متوقفة لحد ما تتضاف المصادقة. مفيش أزرار إضافة/تعديل/حذف شغالة
                في الداشبورد.
              </dd>
            </div>
          </dl>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="اختصارات" stamp="SHORTCUTS">
            <div className="grid grid-cols-2 gap-px bg-ink/10">
              <Link
                href="/admin/questions"
                className="flex items-center justify-between gap-2 bg-paper-warm px-3 py-3 text-xs font-bold transition-colors hover:bg-copper/10"
              >
                <span className="flex items-center gap-1.5">
                  <ListChecksIcon className="size-3.5 text-copper" />
                  الأسئلة
                </span>
                <span className="font-mono text-[10px] text-ink-soft">
                  {formatNumber(data.totalLive)}
                </span>
              </Link>
              <Link
                href="/admin/health"
                className="flex items-center justify-between gap-2 bg-paper-warm px-3 py-3 text-xs font-bold transition-colors hover:bg-copper/10"
              >
                <span className="flex items-center gap-1.5">
                  <ActivityIcon className="size-3.5 text-copper" />
                  صحة المحتوى
                </span>
                <ArrowUpRightIcon className="size-3.5 text-ink-soft" />
              </Link>
              <Link
                href="/admin/feedback"
                className="flex items-center justify-between gap-2 bg-paper-warm px-3 py-3 text-xs font-bold transition-colors hover:bg-copper/10"
              >
                <span className="flex items-center gap-1.5">
                  <MessageSquareIcon className="size-3.5 text-ink-soft" />
                  الرسائل
                </span>
                <Tag className="border-ink/20 bg-ink/5 text-[9px] text-ink-soft">
                  مقفول
                </Tag>
              </Link>
              <Link
                href="/admin/notes"
                className="flex items-center justify-between gap-2 bg-paper-warm px-3 py-3 text-xs font-bold transition-colors hover:bg-copper/10"
              >
                <span className="flex items-center gap-1.5">
                  <StickyNoteIcon className="size-3.5 text-ink-soft" />
                  الملاحظات
                </span>
                <Tag className="border-ink/20 bg-ink/5 text-[9px] text-ink-soft">
                  مقفول
                </Tag>
              </Link>
            </div>
          </Panel>

          <p className="border-2 border-dashed border-ink/20 px-3 py-2 text-[11px] leading-relaxed text-ink-soft/80">
            ملاحظة: رسائل اللاعبين والملاحظات ليها جداول في Neon، لكن مش هتتعرض
            من غير مصادقة لأنها ممكن تحتوي بيانات خاصة. الأرقام هنا كلها من
            جداول المحتوى العامة.
          </p>
        </div>
      </div>
    </div>
  )
}
