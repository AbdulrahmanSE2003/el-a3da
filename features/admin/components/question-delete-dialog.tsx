"use client"

import { useState, useTransition } from "react"
import { AlertTriangleIcon, Trash2Icon } from "lucide-react"
import { AppDialog } from "@/components/ui/AppDialog"
import { Button } from "@/components/ui/button"
import { deleteQuestionAction } from "../server/question-actions"
import type { ContentSetMeta, QuestionRow } from "../lib/types"

interface QuestionDeleteDialogProps {
  question: QuestionRow
  setMeta: ContentSetMeta
  onClose: () => void
  onDeleted: () => void
}

export function QuestionDeleteDialog({
  question,
  setMeta,
  onClose,
  onDeleted,
}: QuestionDeleteDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await deleteQuestionAction({ id: question.id })
        if (!result.ok) {
          setError(result.error ?? "تعذر حذف السؤال. حاول تاني.")
          return
        }
        onDeleted()
      } catch {
        setError("تعذر حذف السؤال. حاول تاني.")
      }
    })
  }

  return (
    <AppDialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose()
      }}
      title="حذف السؤال"
      subtitle={`${setMeta.title} · ${question.externalId}`}
    >
      <div className="flex gap-3 border-2 border-danger-brand/40 bg-danger-brand/10 px-4 py-3 text-danger-brand">
        <AlertTriangleIcon className="mt-0.5 size-5 shrink-0" />
        <div className="text-xs leading-relaxed">
          <p className="font-bold">هل تريد حذف السؤال من المحتوى النشط؟</p>
          <p className="mt-1 text-ink-soft">
            هيتم حذفه حذفًا ناعمًا (soft delete): هيختفي من قائمة الأسئلة النشطة
            والأرقام في الداشبورد، لكن السجل هيفضل محفوظًا في قاعدة البيانات.
          </p>
          <p className="mt-2 border-t border-danger-brand/20 pt-2 text-[11px] text-ink-soft">
            ملاحظة: الحذف بيزوّد إصدار المجموعة، والأجهزة هتزامن التغيير في
            الجلسات الجديدة. الجلسات الشغالة دلوقتي بتحافظ على مجموعة الأسئلة
            اللي بدأت بيها.
          </p>
        </div>
      </div>

      <div className="border-2 border-ink/10 bg-paper-warm/50 p-3">
        <p className="font-mono text-[10px] font-bold tracking-widest text-ink-soft">
          نص السؤال
        </p>
        <p className="mt-1 line-clamp-4 text-sm leading-relaxed font-bold text-ink">
          {question.text || "— نص غير متوفر —"}
        </p>
        <p className="mt-2 font-mono text-[10px] text-ink-soft/70" dir="ltr">
          {question.externalId}
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="border-2 border-danger-brand/40 bg-danger-brand/10 px-3 py-2 text-xs font-bold text-danger-brand"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t border-ink/10 pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isPending}
        >
          إلغاء
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2Icon />
          {isPending ? "جاري الحذف..." : "حذف السؤال"}
        </Button>
      </div>
    </AppDialog>
  )
}
