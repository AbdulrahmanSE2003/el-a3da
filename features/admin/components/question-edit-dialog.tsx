"use client"

import { useState, useTransition } from "react"
import { AppDialog } from "@/components/ui/AppDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateQuestionAction } from "../server/question-actions"
import {
  QUESTION_BADGE_LABEL_MAX_LENGTH,
  QUESTION_CATEGORY_MAX_LENGTH,
  QUESTION_CORRECT_ANSWER_MAX_LENGTH,
  QUESTION_TEXT_MAX_LENGTH,
  validateQuestionDraft,
  type QuestionDraft,
  type QuestionField,
  type QuestionFieldErrors,
} from "../lib/question-form"
import type { ContentSetMeta, QuestionRow } from "../lib/types"

interface QuestionEditDialogProps {
  question: QuestionRow
  setMeta: ContentSetMeta
  onClose: () => void
  onSaved: () => void
}

export function QuestionEditDialog({
  question,
  setMeta,
  onClose,
  onSaved,
}: QuestionEditDialogProps) {
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
          setFormError(result.error ?? "تعذر حفظ التعديل. حاول تاني.")
          if (result.fieldErrors) setFieldErrors(result.fieldErrors)
          return
        }

        onSaved()
      } catch {
        setFormError("تعذر حفظ التعديل. حاول تاني.")
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
      <div className="grid gap-2 border-2 border-ink/10 bg-paper-warm/50 p-3 text-[11px] sm:grid-cols-3">
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-ink-soft">
            المعرف
          </p>
          <p className="mt-1 font-mono" dir="ltr">
            {question.externalId}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-ink-soft">
            الترتيب
          </p>
          <p className="mt-1 font-mono" dir="ltr">
            {question.position}
          </p>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold tracking-widest text-ink-soft">
            UUID
          </p>
          <p className="mt-1 truncate font-mono text-[10px]" dir="ltr">
            {question.id}
          </p>
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

        <div>
          <Label htmlFor="question-text">
            نص السؤال <span className="text-danger-brand">*</span>
          </Label>
          <Textarea
            id="question-text"
            value={draft.text}
            onChange={(event) => setField("text", event.target.value)}
            maxLength={QUESTION_TEXT_MAX_LENGTH}
            rows={5}
            autoFocus
            aria-invalid={fieldErrors.text ? true : undefined}
            aria-describedby={
              fieldErrors.text ? "question-text-error" : undefined
            }
            className="min-h-32"
          />
          {fieldErrors.text && (
            <p
              id="question-text-error"
              className="mt-1.5 text-[11px] font-bold text-danger-brand"
            >
              {fieldErrors.text}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="question-category">
              الفئة{" "}
              {setMeta.hasOptionalCategory ? (
                <span className="font-normal normal-case">(اختيارية)</span>
              ) : (
                <span className="text-danger-brand">*</span>
              )}
            </Label>
            <Input
              id="question-category"
              value={draft.category}
              onChange={(event) => setField("category", event.target.value)}
              maxLength={QUESTION_CATEGORY_MAX_LENGTH}
              aria-invalid={fieldErrors.category ? true : undefined}
              aria-describedby={
                fieldErrors.category ? "question-category-error" : undefined
              }
            />
            {fieldErrors.category && (
              <p
                id="question-category-error"
                className="mt-1.5 text-[11px] font-bold text-danger-brand"
              >
                {fieldErrors.category}
              </p>
            )}
          </div>

          {setMeta.hasCorrectAnswer && (
            <div>
              <Label htmlFor="question-answer">
                الإجابة الصحيحة <span className="text-danger-brand">*</span>
              </Label>
              <Input
                id="question-answer"
                value={draft.correctAnswer}
                onChange={(event) =>
                  setField("correctAnswer", event.target.value)
                }
                maxLength={QUESTION_CORRECT_ANSWER_MAX_LENGTH}
                aria-invalid={fieldErrors.correctAnswer ? true : undefined}
                aria-describedby={
                  fieldErrors.correctAnswer
                    ? "question-answer-error"
                    : undefined
                }
              />
              {fieldErrors.correctAnswer && (
                <p
                  id="question-answer-error"
                  className="mt-1.5 text-[11px] font-bold text-danger-brand"
                >
                  {fieldErrors.correctAnswer}
                </p>
              )}
            </div>
          )}

          {setMeta.hasBadgeLabel && (
            <div>
              <Label htmlFor="question-badge">
                الشارة{" "}
                <span className="font-normal normal-case">(اختيارية)</span>
              </Label>
              <Input
                id="question-badge"
                value={draft.badgeLabel}
                onChange={(event) => setField("badgeLabel", event.target.value)}
                maxLength={QUESTION_BADGE_LABEL_MAX_LENGTH}
                aria-invalid={fieldErrors.badgeLabel ? true : undefined}
                aria-describedby={
                  fieldErrors.badgeLabel ? "question-badge-error" : undefined
                }
              />
              {fieldErrors.badgeLabel && (
                <p
                  id="question-badge-error"
                  className="mt-1.5 text-[11px] font-bold text-danger-brand"
                >
                  {fieldErrors.badgeLabel}
                </p>
              )}
            </div>
          )}
        </div>

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
            {isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
        </div>
      </form>
    </AppDialog>
  )
}
