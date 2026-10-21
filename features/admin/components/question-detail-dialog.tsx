"use client"

import { AppDialog } from "@/components/ui/AppDialog"
import { Button } from "@/components/ui/button"
import { Tag } from "./table"
import { formatDateTime } from "../lib/format"
import type { ContentSetMeta, QuestionRow } from "../lib/types"

interface QuestionDetailDialogProps {
  question: QuestionRow
  setMeta: ContentSetMeta
  onClose: () => void
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 border-b border-ink/10 py-2 text-sm">
      <span className="font-mono text-[10px] font-bold tracking-widest text-ink-soft">
        {label}
      </span>
      <div className="min-w-0 font-medium text-ink">{children}</div>
    </div>
  )
}

/** تفاصيل العنصر من قاعدة البيانات — قراءة فقط، مفيش أزرار تعديل. */
export function QuestionDetailDialog({
  question,
  setMeta,
  onClose,
}: QuestionDetailDialogProps) {
  return (
    <AppDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={setMeta.title}
      subtitle={`${setMeta.stamp} · ${setMeta.sourceFile}`}
    >
      <div className="flex flex-col">
        <Row label="المعرّف">
          <span className="font-mono text-xs" dir="ltr">
            {question.externalId}
          </span>
        </Row>

        <Row label="UUID">
          <span className="font-mono text-[11px] text-ink-soft" dir="ltr">
            {question.id}
          </span>
        </Row>

        <Row label="Position">
          <span className="font-mono text-xs" dir="ltr">
            {question.position}
          </span>
          <span className="ms-2 text-[10px] text-ink-soft/70">
            ترتيب من 0 — المرجع في العرض
          </span>
        </Row>

        <Row label="الفئة">
          {question.category ? (
            <Tag className="border-ink/20 bg-ink/5 text-ink-soft">
              {question.category}
            </Tag>
          ) : (
            <span className="text-xs text-ink-soft/70">— غير محددة —</span>
          )}
        </Row>

        {setMeta.hasCorrectAnswer && (
          <Row label="الإجابة">
            {question.correctAnswer ? (
              <span>{question.correctAnswer}</span>
            ) : (
              <span className="text-xs font-bold text-danger-brand">
                ناقصة — محتاجة مراجعة
              </span>
            )}
          </Row>
        )}

        {setMeta.hasBadgeLabel && (
          <Row label="الشارة">
            {question.badgeLabel ?? (
              <span className="text-xs text-ink-soft/70">— فاضية —</span>
            )}
          </Row>
        )}

        <Row label="الحالة">
          {question.deletedAt ? (
            <span className="text-xs font-bold text-danger-brand">
              محذوف soft delete · {formatDateTime(question.deletedAt)}
            </span>
          ) : (
            <span className="text-xs font-bold text-copper">حي</span>
          )}
        </Row>

        <div className="pt-3">
          <p className="font-mono text-[10px] font-bold tracking-widest text-ink-soft">
            النص
          </p>
          <p className="mt-2 text-base leading-relaxed font-bold text-ink">
            {question.text || (
              <span className="text-danger-brand">
                النص فاضي — العنصر مش جاهز للنشر
              </span>
            )}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-ink/10 pt-3 text-[10px] text-ink-soft/80">
          <p>
            أُنشئ:{" "}
            <time dateTime={question.createdAt} className="font-mono" dir="ltr">
              {formatDateTime(question.createdAt)}
            </time>
          </p>
          <p className="text-end">
            آخر تحديث:{" "}
            <time dateTime={question.updatedAt} className="font-mono" dir="ltr">
              {formatDateTime(question.updatedAt)}
            </time>
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    </AppDialog>
  )
}
