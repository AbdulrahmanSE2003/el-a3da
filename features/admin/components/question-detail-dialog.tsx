"use client"

import { PencilIcon, Trash2Icon } from "lucide-react"
import { AppDialog } from "@/components/ui/AppDialog"
import { Button } from "@/components/ui/button"
import { CategoryBadge } from "./category-badge"
import { formatDateTime } from "../lib/format"
import type { ContentSetMeta, QuestionRow } from "../lib/types"

interface QuestionDetailDialogProps {
  question: QuestionRow
  setMeta: ContentSetMeta
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
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

/** تفاصيل العنصر من قاعدة البيانات مع انتقال مباشر للتعديل أو الحذف. */
export function QuestionDetailDialog({
  question,
  setMeta,
  onClose,
  onEdit,
  onDelete,
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
        <Row label="معرف السؤال">
          <span className="font-mono text-xs" dir="ltr">
            {question.externalId}
          </span>
        </Row>

        <Row label="المعرف الداخلي">
          <span className="font-mono text-[11px] text-ink-soft" dir="ltr">
            {question.id}
          </span>
        </Row>

        <Row label="الترتيب">
          <span className="font-mono text-xs" dir="ltr">
            {question.position}
          </span>
          <span className="ms-2 text-[10px] text-ink-soft/70">
            الترتيب بيبدأ من 0
          </span>
        </Row>

        <Row label="الفئة">
          {question.category ? (
            <CategoryBadge category={question.category} setId={setMeta.id} />
          ) : (
            <span className="text-xs text-ink-soft/70">— بدون فئة —</span>
          )}
        </Row>

        {setMeta.hasCorrectAnswer && (
          <Row label="الإجابة">
            {question.correctAnswer ? (
              <span>{question.correctAnswer}</span>
            ) : (
              <span className="text-xs font-bold text-danger-brand">
                ناقصة — محتاجة مراجعة منك
              </span>
            )}
          </Row>
        )}

        {setMeta.hasBadgeLabel && (
          <Row label="الشارة">
            {question.badgeLabel ?? (
              <span className="text-xs text-ink-soft/70">بدون شارة</span>
            )}
          </Row>
        )}

        <Row label="الحالة">
          {question.deletedAt ? (
            <span className="text-xs font-bold text-danger-brand">
              محذوف — محفوظ في الأرشيف · {formatDateTime(question.deletedAt)}
            </span>
          ) : (
            <span className="text-xs font-bold text-copper">نشط</span>
          )}
        </Row>

        <div className="pt-3">
          <p className="font-mono text-[10px] font-bold tracking-widest text-ink-soft">
            النص
          </p>
          <p className="mt-2 text-base leading-relaxed font-bold text-ink">
            {question.text || (
              <span className="text-danger-brand">
                النص فاضي — السؤال مش جاهز للنشر بعد
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

        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-ink/10 pt-4">
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="me-auto"
            >
              <Trash2Icon />
              حذف
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <PencilIcon />
              تعديل
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    </AppDialog>
  )
}
