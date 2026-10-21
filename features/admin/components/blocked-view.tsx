import Link from "next/link"
import { DatabaseIcon, LockIcon } from "lucide-react"
import { PageHeader } from "./page-header"
import { Tag } from "./table"

interface BlockedViewProps {
  stamp: string
  title: string
  description: string
  table: string
}

/**
 * قسم موجود في المخطط لكنه مش هيتعرض قبل المصادقة:
 * feedback و notes ممكن يحتوا بيانات لاعبين/ملاحظات داخلية.
 */
export function BlockedView({
  stamp,
  title,
  description,
  table,
}: BlockedViewProps) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        stamp={stamp}
        title={title}
        description={description}
        action={
          <Tag className="border-danger-brand/40 bg-danger-brand/10 font-mono text-danger-brand">
            AUTH REQUIRED
          </Tag>
        }
      />

      <section className="border-2 border-ink bg-paper-warm">
        <div className="flex items-start gap-3 border-b border-ink/10 px-4 py-4">
          <span className="icon-box shrink-0 border-danger-brand/30 bg-danger-brand/10 text-danger-brand">
            <LockIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-black text-ink">
              القسم مش متاح من غير تسجيل دخول
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-soft">
              الجدول موجود في Neon، لكن المحتوى ده ممكن يحتوي بيانات خاصة.
              الداشبورد الحالي مفيهوش مصادقة، فمش هيعرض الرسائل أو الملاحظات
              لحد ما تتضاف حماية للمسؤول.
            </p>
          </div>
        </div>

        <dl className="divide-y divide-ink/10">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <dt className="flex items-center gap-1.5 text-xs font-bold">
              <DatabaseIcon className="size-4 text-copper" />
              الجدول المتوقع
            </dt>
            <dd>
              <code
                className="border border-ink/15 bg-paper px-1.5 py-0.5 font-mono text-[11px]"
                dir="ltr"
              >
                {table}
              </code>
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <dt className="text-xs font-bold">المصادقة</dt>
            <dd className="font-mono text-[10px] font-bold text-danger-brand">
              غير مفعّلة
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <dt className="text-xs font-bold">الكتابة</dt>
            <dd className="font-mono text-[10px] font-bold text-danger-brand">
              متوقفة
            </dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-2 border-dashed border-ink/20 px-3 py-3 text-xs text-ink-soft">
        <Link
          href="/admin"
          className="font-bold text-copper underline-offset-4 hover:underline"
        >
          رجوع للنظرة العامة
        </Link>
        <span aria-hidden>·</span>
        <span>
          المصادقة المطلوبة موصوفة في <code className="font-mono">docs/admin-auth.md</code>{" "}
          ولسه مش منفّذة.
        </span>
      </div>
    </div>
  )
}
