"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCheckIcon,
  EyeIcon,
  Loader2Icon,
  MailOpenIcon,
} from "lucide-react"
import { updateFeedbackStatusAction } from "../server/feedback-actions"
import {
  FEEDBACK_STATUS_LABELS,
  type FeedbackStatus,
} from "@/features/feedback/lib/feedback"
import { FEEDBACK_STATUS_CLASS } from "../feedback/lib/style"
import { cn } from "@/lib/utils"

const STATUS_ICONS: Record<FeedbackStatus, typeof EyeIcon> = {
  open: MailOpenIcon,
  reviewed: EyeIcon,
  done: CheckCheckIcon,
}

interface FeedbackStatusControlProps {
  feedbackId: string
  status: FeedbackStatus
  onChanged?: (status: FeedbackStatus) => void
}

/**
 * أزرار تغيير الحالة (مفتوحة / مقروءة / تم الحل). الرجوع مسموح.
 * بتستدعي server action محمي، وبعدها بتعمل refresh لبيانات الصفحة.
 *
 * الجدول بيعرض الحالة كبادج للقراءة بس — التغيير بيتم من هنا في الدايلوج.
 */
export function FeedbackStatusControl({
  feedbackId,
  status,
  onChanged,
}: FeedbackStatusControlProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const change = (next: FeedbackStatus) => {
    if (next === status || isPending) return
    setError(null)

    startTransition(async () => {
      try {
        const result = await updateFeedbackStatusAction({
          id: feedbackId,
          status: next,
        })

        if (!result.ok) {
          setError(result.error ?? "مقدرناش نحدّث الحالة. جرّب تاني.")
          return
        }

        onChanged?.(next)
        router.refresh()
      } catch {
        setError("مقدرناش نحدّث الحالة. جرّب تاني.")
      }
    })
  }

  const options: FeedbackStatus[] = ["open", "reviewed", "done"]

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const Icon = STATUS_ICONS[option]
          const active = option === status
          return (
            <button
              key={option}
              type="button"
              onClick={() => change(option)}
              disabled={isPending || active}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center justify-center gap-2 border-2 px-3 py-2.5 text-xs font-bold transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-copper/50 disabled:cursor-default",
                active
                  ? cn("border-ink shadow-none", FEEDBACK_STATUS_CLASS[option])
                  : "border-ink/20 bg-paper text-ink-soft hover:border-ink/50 hover:text-ink"
              )}
            >
              {isPending && !active ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <Icon className="size-4" />
              )}
              {FEEDBACK_STATUS_LABELS[option]}
            </button>
          )
        })}
      </div>

      {error && (
        <p role="alert" className="text-[11px] font-bold text-danger-brand">
          {error}
        </p>
      )}
    </div>
  )
}
