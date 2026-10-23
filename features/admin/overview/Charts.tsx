"use client"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { EmptyState } from "../components/empty-state"
import { Panel } from "../components/overview-view"
import { OverviewData } from "../lib/types"
import { getSetColor } from "../constants"
import { ArrowUpRightIcon } from "lucide-react"
import { useReducedMotion } from "framer-motion"
import { Cell, Pie, PieChart } from "recharts"
import { Tag } from "../components/table"
import { formatNumber } from "../lib/format"
import Link from "next/link"
import { cn } from "cn"

const Charts = ({ data }: { data: OverviewData }) => {
  const reduceMotion = useReducedMotion()

  const chartConfig: ChartConfig = Object.fromEntries(
    data.sets.map((set) => [
      set.id,
      { label: set.title, color: getSetColor(set.id) },
    ])
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      {/* Content Distribution Panel */}
      <Panel title="توزيع المحتوى" stamp="CONTENT">
        {data.totalLive === 0 ? (
          <div className="p-6">
            <EmptyState
              title="لا يوجد محتوى نشط"
              description="قاعدة البيانات فارغة أو تمت أرشفة جميع العناصر."
            />
          </div>
        ) : (
          <div className="grid items-center gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_200px]">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-60 w-full"
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
                  outerRadius={92}
                  strokeWidth={2}
                  stroke="var(--color-ink)"
                  isAnimationActive={!reduceMotion}
                  animationBegin={120}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {data.sets.map((set) => (
                    <Cell key={set.id} fill={getSetColor(set.id)} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Set Legend */}
            <ul className="flex flex-col gap-2.5">
              {data.sets.map((set) => (
                <li
                  key={set.id}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-xs border border-ink/20 shadow-xs"
                      style={{ backgroundColor: getSetColor(set.id) }}
                    />
                    <span className="truncate font-semibold text-foreground">
                      {set.title}
                    </span>
                    {!set.isUsed && (
                      <Tag className="shrink-0 border-copper/30 bg-copper/10 px-1.5 py-0 text-[10px] text-copper">
                        معطل
                      </Tag>
                    )}
                  </div>
                  <span className="shrink-0 font-mono font-bold text-ink-soft">
                    {formatNumber(set.liveCount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-ink/10 bg-paper-warm/30 px-5 py-3">
          <span className="text-xs text-ink-soft/70">
            تتم معالجة العناصر النشطة فقط في الرسم البياني.
          </span>
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-copper transition-opacity hover:opacity-80"
          >
            إدارة الأسئلة
            <ArrowUpRightIcon className="size-3.5" />
          </Link>
        </div>
      </Panel>

      {/* Sets & Versions Panel */}
      <Panel title="المجموعات والإصدارات" stamp="VERSIONS">
        <div className="divide-y divide-ink/10">
          {data.sets.map((set) => (
            <div
              key={set.id}
              className="group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-paper-warm/40"
            >
              {/* Left Column: Set Info */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs font-bold text-foreground">
                    {set.title}
                  </span>
                </div>
                <p className="mt-1 truncate font-mono text-[11px] tracking-tight text-ink-soft/70">
                  {set.stamp} · {set.sourceFile}
                </p>
              </div>

              {/* Right Column: Status Metrics */}
              <div className="flex shrink-0 items-center gap-4 text-end">
                <div className="min-w-9">
                  <p className="font-mono text-xs font-bold text-copper">
                    {formatNumber(set.liveCount)}
                  </p>
                  <p className="text-[10px] text-ink-soft/70">نتيجة</p>
                </div>

                <div className="min-w-9">
                  <p
                    className={cn(
                      "font-mono text-xs font-black",
                      set.deletedCount > 0
                        ? "text-danger-brand"
                        : "text-ink-soft/50"
                    )}
                  >
                    {formatNumber(set.deletedCount)}
                  </p>
                  <p className="text-[10px] text-ink-soft/70">مؤرشف</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

export default Charts
