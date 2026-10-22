"use client"

import { useState } from "react"
import { CalendarClockIcon, ImageIcon, MailIcon } from "lucide-react"
import { AppDialog } from "@/components/ui/AppDialog"
import { Button } from "@/components/ui/button"
import { formatDateTime, formatNumber } from "../lib/format"
import { getSetMeta } from "../lib/content-sets"
import {
  FEEDBACK_PRIORITY_LABELS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPE_LABELS,
  formatFeedbackFileSize,
  type FeedbackStatus,
} from "@/features/feedback/lib/feedback"
import {
  FEEDBACK_PRIORITY_CLASS,
  FEEDBACK_STATUS_CLASS,
  FEEDBACK_TYPE_CLASS,
} from "../feedback/lib/style"
import type { FeedbackRow } from "../feedback/lib/types"
import { FeedbackStatusControl } from "./FeedbackStatusControl"
import { cn } from "@/lib/utils"

interface FeedbackDetailDialogProps {
  feedback: FeedbackRow
  onClose: () => void
  onStatusChanged?: (id: string, status: FeedbackStatus) => void
}

function MetaRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-ink/10 px-3 py-2.5 last:border-b-0">
      <dt className="font-mono text-[10px] font-bold tracking-widest text-ink-soft/70">
        {label}
      </dt>
      <dd className="text-xs font-bold break-words text-ink">{children}</dd>
    </div>
  )
}

export function FeedbackDetailDialog({
  feedback,
  onClose,
  onStatusChanged,
}: FeedbackDetailDialogProps) {
  const [status, setStatus] = useState<FeedbackStatus>(feedback.status)

  return (
    <AppDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={FEEDBACK_TYPE_LABELS[feedback.type]}
      subtitle={
        <span className="inline-flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <CalendarClockIcon className="size-3.5" />
            {formatDateTime(feedback.createdAt)}
          </span>
        </span>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "border px-2 py-0.5 font-mono text-[10px] font-bold",
            FEEDBACK_TYPE_CLASS[feedback.type]
          )}
        >
          {FEEDBACK_TYPE_LABELS[feedback.type]}
        </span>
        <span
          className={cn(
            "border px-2 py-0.5 font-mono text-[10px] font-bold",
            FEEDBACK_PRIORITY_CLASS[feedback.priority]
          )}
        >
          أولوية {FEEDBACK_PRIORITY_LABELS[feedback.priority]}
        </span>
        <span
          className={cn(
            "border px-2 py-0.5 font-mono text-[10px] font-bold",
            FEEDBACK_STATUS_CLASS[status]
          )}
        >
          {FEEDBACK_STATUS_LABELS[status]}
        </span>
        {feedback.rating && (
          <span className="border border-copper/40 bg-copper/10 px-2 py-0.5 font-mono text-[10px] font-bold text-copper">
            تقييم {feedback.rating}/5
          </span>
        )}
      </div>

      <section className="border-2 border-ink bg-paper-warm">
        <p className="border-b border-ink/10 px-3 py-2 font-mono text-[10px] font-bold tracking-widest text-ink-soft/70">
          حالة الرسالة
        </p>
        <div className="px-3 py-3">
          <FeedbackStatusControl
            feedbackId={feedback.id}
            status={status}
            onChanged={(next) => {
              setStatus(next)
              onStatusChanged?.(feedback.id, next)
            }}
          />
          <p className="mt-2 text-[10px] leading-relaxed text-ink-soft/60">
            مفتوحة: اتبعتت ولسه مشفتش · مقروءة: قريتها بس لسه متحلتش · تم الحل:
            قريتها واشتغلت عليها. الرجوع مسموح في أي وقت.
          </p>
        </div>
      </section>

      <section className="border-2 border-ink bg-paper-warm">
        <p className="border-b border-ink/10 px-3 py-2 font-mono text-[10px] font-bold tracking-widest text-ink-soft/70">
          نص الرسالة
        </p>
        <p className="px-3 py-3 text-sm leading-relaxed whitespace-pre-wrap text-ink">
          {feedback.message}
        </p>
      </section>

      <dl className="border-2 border-ink bg-paper-warm">
        <MetaRow label="التواصل">
          {feedback.contact ? (
            <span className="inline-flex items-center gap-1.5" dir="auto">
              <MailIcon className="size-3.5 text-copper" />
              {feedback.contact}
            </span>
          ) : (
            <span className="text-ink-soft/60">—</span>
          )}
        </MetaRow>

        <MetaRow label="المجموعة">
          {feedback.setId ? (
            getSetMeta(feedback.setId).title
          ) : (
            <span className="text-ink-soft/60">—</span>
          )}
        </MetaRow>

        <MetaRow label="معرّف السؤال">
          {feedback.questionExternalId ? (
            <span className="font-mono" dir="ltr">
              {feedback.questionExternalId}
            </span>
          ) : (
            <span className="text-ink-soft/60">—</span>
          )}
        </MetaRow>

        <MetaRow label="إصدار التطبيق">
          {feedback.appVersion ? (
            <span className="font-mono" dir="ltr">
              {feedback.appVersion}
            </span>
          ) : (
            <span className="text-ink-soft/60">—</span>
          )}
        </MetaRow>

        <MetaRow label="اتقرأت في">
          {feedback.reviewedAt ? (
            <span className="font-mono text-[11px]">
              {formatDateTime(feedback.reviewedAt)}
            </span>
          ) : (
            <span className="text-ink-soft/60">—</span>
          )}
        </MetaRow>

        <MetaRow label="اتقرأت بواسطة">
          {feedback.reviewedBy ? (
            <span className="font-mono text-[11px]" dir="ltr">
              {feedback.reviewedBy}
            </span>
          ) : (
            <span className="text-ink-soft/60">—</span>
          )}
        </MetaRow>

        <MetaRow label="بيانات الجهاز">
          {feedback.deviceInfo ? (
            <span className="font-mono text-[11px]" dir="ltr">
              {feedback.deviceInfo}
            </span>
          ) : (
            <span className="text-ink-soft/60">—</span>
          )}
        </MetaRow>
      </dl>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-widest text-ink-soft/70">
            <ImageIcon className="size-3.5" />
            الصور المرفقة
          </h3>
          <span className="font-mono text-[10px] text-ink-soft/60">
            {formatNumber(feedback.attachments.length)}
          </span>
        </div>

        {feedback.attachments.length === 0 ? (
          <p className="border-2 border-dashed border-ink/20 px-3 py-4 text-center text-xs text-ink-soft">
            مفيش صور مرفقة بالرسالة دي.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {feedback.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={`/api/admin/feedback/attachments/${attachment.id}`}
                target="_blank"
                rel="noreferrer"
                className="group block border-2 border-ink bg-paper-warm outline-none focus-visible:ring-[3px] focus-visible:ring-copper/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/admin/feedback/attachments/${attachment.id}`}
                  alt={`مرفق ${FEEDBACK_TYPE_LABELS[feedback.type]}`}
                  loading="lazy"
                  className="h-28 w-full object-cover transition-transform group-hover:scale-[1.02]"
                />
                <span className="block border-t border-ink/10 px-2 py-1 font-mono text-[10px] text-ink-soft">
                  {formatFeedbackFileSize(attachment.sizeBytes)}
                </span>
              </a>
            ))}
          </div>
        )}

        <p className="mt-2 text-[10px] leading-relaxed text-ink-soft/60">
          الصور محفوظة في bucket خاص، وبتتعرض من خلال رابط موقّع مؤقت للجلسة.
        </p>
      </section>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          إغلاق
        </Button>
      </div>
    </AppDialog>
  )
}
