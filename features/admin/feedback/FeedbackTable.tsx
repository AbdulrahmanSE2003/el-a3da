"use client"

import { EyeIcon, ImageOffIcon, PaperclipIcon, StarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "../components/empty-state"
import {
  AdminTable,
  AdminTHead,
  AdminTR,
  AdminTH,
  AdminTD,
  Tag,
} from "../components/table"
import { formatDateTime, formatNumber } from "../lib/format"
import { getSetMeta } from "../lib/content-sets"
import {
  FEEDBACK_PRIORITY_LABELS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPE_LABELS,
} from "@/features/feedback/lib/feedback"
import {
  FEEDBACK_PRIORITY_CLASS,
  FEEDBACK_STATUS_CLASS,
  FEEDBACK_TYPE_CLASS,
} from "../feedback/lib/style"
import type { FeedbackRow } from "../feedback/lib/types"
import { cn } from "@/lib/utils"

interface FeedbackTableProps {
  rows: FeedbackRow[]
  total: number
  isPending: boolean
  hasFilters: boolean
  onViewFeedback: (feedback: FeedbackRow) => void
}

export function FeedbackTable({
  rows,
  total,
  isPending,
  hasFilters,
  onViewFeedback,
}: FeedbackTableProps) {
  return (
    <div
      className={cn(
        "border-2 border-ink bg-paper-warm transition-opacity duration-150",
        isPending && "pointer-events-none opacity-60"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-paper-warm/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-copper" />
          <p className="font-mono text-[10px] font-bold tracking-widest text-ink-soft uppercase">
            الرسائل · {formatNumber(total)}
          </p>
        </div>

        <p className="text-[11px] font-medium text-ink-soft/80">
          {isPending
            ? "جاري التحديث..."
            : `عرض ${formatNumber(rows.length)} من أصل ${formatNumber(total)}`}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={hasFilters ? ImageOffIcon : PaperclipIcon}
            title={hasFilters ? "لا توجد نتائج مطابقة" : "مفيش رسائل لسه"}
            description={
              hasFilters
                ? "جرب تغيير معايير التصفية أو كلمة البحث."
                : "أول ما يوصل لك رسالة من اللاعبين هتظهر هنا."
            }
          />
        </div>
      ) : (
        <AdminTable>
          <AdminTHead>
            <tr>
              <AdminTH className="w-32">النوع</AdminTH>
              <AdminTH>الرسالة</AdminTH>
              <AdminTH className="w-20">الأولوية</AdminTH>
              <AdminTH className="w-20 text-center">التقييم</AdminTH>
              <AdminTH className="w-20 text-center">الصور</AdminTH>
              <AdminTH className="w-32">التاريخ</AdminTH>
              <AdminTH className="w-28 text-center">الحالة</AdminTH>
              <AdminTH className="w-16 text-end">إجراء</AdminTH>
            </tr>
          </AdminTHead>

          <tbody>
            {rows.map((feedback) => {
              const isDone = feedback.status === "done"
              return (
                <AdminTR
                  key={feedback.id}
                  className={cn(
                    "group transition-colors hover:bg-paper-warm/60",
                    isDone && "opacity-60"
                  )}
                >
                  <AdminTD>
                    <Tag
                      className={cn(
                        "font-bold",
                        FEEDBACK_TYPE_CLASS[feedback.type]
                      )}
                    >
                      {FEEDBACK_TYPE_LABELS[feedback.type]}
                    </Tag>
                  </AdminTD>

                  <AdminTD className="max-w-md">
                    <button
                      type="button"
                      onClick={() => onViewFeedback(feedback)}
                      className="line-clamp-2 text-start text-sm font-bold text-foreground transition-colors hover:text-copper"
                    >
                      {feedback.message}
                    </button>
                    <p
                      className="mt-1 line-clamp-1 text-[11px] text-ink-soft/70"
                      dir="auto"
                    >
                      {feedback.contact
                        ? feedback.contact
                        : feedback.setId
                          ? getSetMeta(feedback.setId).title
                          : "—"}
                    </p>
                  </AdminTD>

                  <AdminTD>
                    <Tag
                      className={cn(
                        "font-bold",
                        FEEDBACK_PRIORITY_CLASS[feedback?.priority]
                      )}
                    >
                      {FEEDBACK_PRIORITY_LABELS[feedback.priority]}
                    </Tag>
                  </AdminTD>

                  <AdminTD className="text-center">
                    {feedback.rating ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-copper">
                        <StarIcon className="size-3.5 fill-current" />
                        {feedback.rating}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-soft/40">—</span>
                    )}
                  </AdminTD>

                  <AdminTD className="text-center">
                    {feedback.attachmentCount > 0 ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-ink-soft">
                        <PaperclipIcon className="size-3.5" />
                        {formatNumber(feedback.attachmentCount)}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-soft/40">—</span>
                    )}
                  </AdminTD>

                  <AdminTD>
                    <time
                      dateTime={feedback.createdAt}
                      className="font-mono text-[11px] text-ink-soft"
                    >
                      {formatDateTime(feedback.createdAt)}
                    </time>
                  </AdminTD>

                  <AdminTD>
                    <div className="flex justify-center">
                      <Tag
                        className={cn(
                          "font-bold",
                          FEEDBACK_STATUS_CLASS[feedback.status]
                        )}
                      >
                        {FEEDBACK_STATUS_LABELS[feedback.status]}
                      </Tag>
                    </div>
                  </AdminTD>

                  <AdminTD>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 text-ink-soft hover:bg-ink/10 hover:text-ink"
                        aria-label="عرض الرسالة"
                        title="عرض الرسالة"
                        onClick={() => onViewFeedback(feedback)}
                      >
                        <EyeIcon className="size-4" />
                      </Button>
                    </div>
                  </AdminTD>
                </AdminTR>
              )
            })}
          </tbody>
        </AdminTable>
      )}
    </div>
  )
}
