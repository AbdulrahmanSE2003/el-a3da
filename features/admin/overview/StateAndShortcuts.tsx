import Link from "next/link"
import { Panel } from "../components/overview-view"
import {
  ActivityIcon,
  ArrowUpRightIcon,
  DatabaseIcon,
  ListChecksIcon,
  LockIcon,
  MessageSquareIcon,
  StickyNoteIcon,
} from "lucide-react"
import { formatNumber } from "../lib/format"
import { OverviewData } from "../lib/types"
import { Badge } from "@/components/ui/badge"

const StateAndShortcuts = ({ data }: { data: OverviewData }) => {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      {/* System Status Panel */}
      <Panel title="حالة النظام" stamp="STATUS">
        <dl className="divide-y divide-ink/10">
          <div className="flex items-center justify-between gap-3 px-5 py-3">
            <dt className="flex items-center gap-2 text-xs font-bold text-foreground">
              <DatabaseIcon className="size-4 text-copper" />
              الاتصال بقاعدة البيانات (Neon)
            </dt>
            <dd className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-copper">
              <span className="size-1.5 animate-pulse rounded-full bg-copper" />
              متصل
            </dd>
          </div>

          <div className="flex items-center justify-between gap-3 px-5 py-3">
            <dt className="flex items-center gap-2 text-xs font-bold text-foreground">
              <LockIcon className="size-4 text-copper" />
              مصادقة المسؤولين (Auth)
            </dt>
            <dd className="font-mono text-[11px] font-bold text-copper">
              مفعّلة
            </dd>
          </div>

          <div className="bg-paper-warm/30 px-5 py-3">
            <dt className="text-xs font-bold text-foreground">
              صلاحيات التعديل
            </dt>
            <dd className="mt-1 text-xs leading-relaxed text-ink-soft">
              تعديل الأسئلة وحذفها (soft delete) متاح من قسم الأسئلة على بيانات
              Neon. الإضافة والنشر وإدارة الرسائل والملاحظات لسه غير متاحة.
            </dd>
          </div>
        </dl>
      </Panel>

      {/* Shortcuts & Info Section */}
      <div className="flex flex-col gap-4">
        <Panel title="اختصارات السريعة" stamp="SHORTCUTS">
          <div className="grid grid-cols-2 gap-px bg-ink/10">
            <Link
              href="/admin/questions"
              className="group flex items-center justify-between gap-2 bg-paper-warm px-3.5 py-3 text-xs font-bold transition-colors hover:bg-copper/10"
            >
              <span className="flex items-center gap-2 text-foreground">
                <ListChecksIcon className="size-4 text-copper" />
                الأسئلة
              </span>
              <span className="font-mono text-[11px] text-ink-soft">
                {formatNumber(data.totalLive)}
              </span>
            </Link>

            <Link
              href="/admin/health"
              className="group flex items-center justify-between gap-2 bg-paper-warm px-3.5 py-3 text-xs font-bold transition-colors hover:bg-copper/10"
            >
              <span className="flex items-center gap-2 text-foreground">
                <ActivityIcon className="size-4 text-copper" />
                صحة المحتوى
              </span>
              <ArrowUpRightIcon className="size-3.5 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <div className="flex cursor-not-allowed items-center justify-between gap-2 bg-paper-warm/50 px-3.5 py-3 text-xs font-bold text-ink-soft/60">
              <span className="flex items-center gap-2">
                <MessageSquareIcon className="size-4 text-ink-soft/40" />
                الرسائل
              </span>
              <Badge variant="outline" className="text-[10px] opacity-70">
                غير متاح
              </Badge>
            </div>

            <div className="flex cursor-not-allowed items-center justify-between gap-2 bg-paper-warm/50 px-3.5 py-3 text-xs font-bold text-ink-soft/60">
              <span className="flex items-center gap-2">
                <StickyNoteIcon className="size-4 text-ink-soft/40" />
                الملاحظات
              </span>
              <Badge variant={"outline"} className="text-[10px] opacity-70">
                غير متاح
              </Badge>
            </div>
          </div>
        </Panel>

        <p className="rounded-xs border-2 border-dashed border-ink/20 bg-paper-warm/20 px-3.5 py-2.5 text-xs leading-relaxed text-ink-soft">
          <strong className="font-bold text-foreground">ملاحظة:</strong> يتم عرض
          بيانات المحتوى العامة فقط. الرسائل والملاحظات مخفية لحماية الخصوصية
          رغم تفعيل المصادقة.
        </p>
      </div>
    </div>
  )
}

export default StateAndShortcuts
