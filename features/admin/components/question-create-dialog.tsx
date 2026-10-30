"use client"

import { useState, useTransition } from "react"
import { AppDialog } from "@/components/ui/AppDialog"
import { Button } from "@/components/ui/button"
import { createQuestionAction } from "../server/question-actions"
import {
  validateQuestionDraft,
  type QuestionDraft,
  type QuestionField,
  type QuestionFieldErrors,
} from "../lib/question-form"
import type { CategoryCount, ContentSetMeta } from "../lib/types"
import { getCategoryValues } from "../lib/question-categories"
import { QuestionFormFields } from "./question-form-fields"

interface QuestionCreateDialogProps {
  setMeta: ContentSetMeta
  categories: CategoryCount[]
  onClose: () => void
  onCreated: () => void
}

export function QuestionCreateDialog({
  setMeta,
  categories,
  onClose,
  onCreated,
}: QuestionCreateDialogProps) {
  const categoryOptions = getCategoryValues(
    setMeta,
    categories.map((cat) => cat.category)
  )

  const [draft, setDraft] = useState<QuestionDraft>({
    text: "",
    category: "",
    correctAnswer: "",
    badgeLabel: "",
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
        const result = await createQuestionAction({
          setId: setMeta.id,
          ...validation.value,
        })

        if (!result.ok) {
          setFormError(result.error ?? "مقدرناش نضيف السؤال. جرّب تاني.")
          if (result.fieldErrors) setFieldErrors(result.fieldErrors)
          return
        }

        onCreated()
      } catch {
        setFormError("مقدرناش نضيف السؤال. جرّب تاني.")
      }
    })
  }

  return (
    <AppDialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose()
      }}
      title="إضافة سؤال"
      subtitle={setMeta.title}
    >
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
          idPrefix="new-question"
          draft={draft}
          setMeta={setMeta}
          categoryOptions={categoryOptions}
          fieldErrors={fieldErrors}
          onChange={setField}
        />

        <p className="text-[10px] leading-relaxed text-ink-soft/70">
          السؤال هيظهر للاعبين في الجلسات الجديدة. الجلسات اللي شغالة دلوقتي مش
          هتتأثر.
        </p>

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
            {isPending ? "بيتم الإضافة..." : "إضافة السؤال"}
          </Button>
        </div>
      </form>
    </AppDialog>
  )
}
