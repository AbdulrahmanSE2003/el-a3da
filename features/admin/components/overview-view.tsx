import { PageHeader } from "./page-header"
import type { OverviewData } from "../lib/types"
import { cn } from "@/lib/utils"
import StatsGrid from "../overview/StatsGrid"
import Charts from "../overview/Charts"
import StateAndShortcuts from "../overview/StateAndShortcuts"

export function Panel({
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
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        stamp="لوحة التحكم"
        title="نظرة عامة"
        description="إحصائيات وقراءات مباشرة من قاعدة البيانات، مع إدارة الأسئلة من قسم الأسئلة."
      />

      <StatsGrid data={data} />

      <Charts data={data} />

      <StateAndShortcuts data={data} />
    </div>
  )
}
