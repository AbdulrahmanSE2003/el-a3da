"use client"

import { useState, useTransition } from "react"
import { AppDialog } from "@/components/ui/AppDialog"
import { Button } from "@/components/ui/button"
import { updateQuestionAction } from "../server/question-actions"
import {
  validateQuestionDraft,
  type QuestionDraft,
  type QuestionField,
  type QuestionFieldErrors,
} from "../lib/question-form"
import type { CategoryCount, ContentSetMeta, QuestionRow } from "../lib/types"
import { getCategoryValues } from "../lib/question-categories"
import { QuestionFormFields } from "./question-form-fields"

interface QuestionEditDialogProps {
  question: QuestionRow
  setMeta: ContentSetMeta
  categories: CategoryCount[]
  onClose: () => void
  onSaved: () => void
}

export function QuestionEditDialog({
  question,
  setMeta,
  categories,
  onClose,
  onSaved,
}: QuestionEditDialogProps) {
  const categoryOptions = getCategoryValues(
    setMeta,
    categories.map((cat) => cat.category)
  )

  const [draft, setDraft] = useState<QuestionDraft>({
    text: question.text,
    category: question.category ?? "",
    correctAnswer: question.correctAnswer ?? "",
    badgeLabel: question.badgeLabel ?? "",
  })
  const [fieldErrors, setFieldErrors] = useState<QuestionFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const setField = (field: QuestionField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const validation = validateQuestionDraft(draft, setMeta)
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors)
      return
    }

    setFieldErrors({})
    startTransition(async () => {
      try {
        const result = await updateQuestionAction({
          id: question.id,
          ...validation.value,
        })

        if (!result.ok) {
          setFormError(result.error ?? "مقدرناش نحفظ التعديل. جرّب تاني.")
          if (result.fieldErrors) setFieldErrors(result.fieldErrors)
          return
        }

        onSaved()
      } catch {
        setFormError("مقدرناش نحفظ التعديل. جرّب تاني.")
      }
    })
  }

  return (
    <AppDialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose()
      }}
      title="تعديل السؤال"
      subtitle={`${setMeta.title} · ${question.externalId}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border border-ink/10 bg-paper-warm/50 p-3 text-[11px]">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] font-bold tracking-widest text-ink-soft uppercase">
            معرف السؤال
          </span>
          <span className="font-mono font-bold text-foreground" dir="ltr">
            {question.externalId.trim() || "—"}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] font-bold tracking-widest text-ink-soft uppercase">
            ترتيب السؤال
          </span>
          <span className="font-mono font-bold text-foreground" dir="ltr">
            {question.position}
          </span>
        </div>

        <div className="flex max-w-45 min-w-0 flex-col gap-0.5">
          <span className="font-mono text-[10px] font-bold tracking-widest text-ink-soft uppercase">
            المعرف الداخلي
          </span>
          <span
            className="truncate font-mono text-[10px] text-ink-soft"
            dir="ltr"
            title={question.id}
          >
            {question.id}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formError && (
          <p
            role="alert"
            className="border-2 border-danger-brand/40 bg-danger-brand/10 px-3 py-2 text-xs font-bold text-danger-brand"
          >
            {formError}
          </p>
        )}

        <QuestionFormFields
          idPrefix="question"
          draft={draft}
          setMeta={setMeta}
          categoryOptions={categoryOptions}
          fieldErrors={fieldErrors}
          onChange={setField}
          autoFocus
        />

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
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "بيتم الحفظ..." : "حفظ التعديلات"}
          </Button>
        </div>
      </form>
    </AppDialog>
  )
}
