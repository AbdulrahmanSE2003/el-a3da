"use client"

import { useState, useTransition } from "react"
import { AppDialog } from "@/components/ui/AppDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createQuestionAction } from "../server/question-actions"
import {
  QUESTION_BADGE_LABEL_MAX_LENGTH,
  QUESTION_CORRECT_ANSWER_MAX_LENGTH,
  QUESTION_EXTERNAL_ID_MAX_LENGTH,
  QUESTION_TEXT_MAX_LENGTH,
  validateQuestionCreateDraft,
  type QuestionCreateDraft,
  type QuestionCreateFieldErrors,
} from "../lib/question-form"
import type { CategoryCount, ContentSetMeta } from "../lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [draft, setDraft] = useState<QuestionCreateDraft>({
    externalId: "",
    text: "",
    category: "",
    correctAnswer: "",
    badgeLabel: "",
  })
  const [fieldErrors, setFieldErrors] = useState<QuestionCreateFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const setField = (field: keyof QuestionCreateDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const validation = validateQuestionCreateDraft(draft, setMeta)
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors)
      return
    }

    setFieldErrors({})
    startTransition(async () => {
      try {
        const result = await createQuestionAction({
          setId: setMeta.id,
          externalId: draft.externalId,
          ...validation.value,
        })

        if (!result.ok) {
          setFormError(result.error ?? "تعذر إضافة السؤال. حاول تاني.")
          if (result.fieldErrors) setFieldErrors(result.fieldErrors)
          return
        }

        onCreated()
      } catch {
        setFormError("تعذر إضافة السؤال. حاول تاني.")
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
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 pt-6"
      >
        {formError && (
          <p
            role="alert"
            className="border-2 border-danger-brand/40 bg-danger-brand/10 px-3 py-2 text-xs font-bold text-danger-brand"
          >
            {formError}
          </p>
        )}

        <div>
          <Label htmlFor="new-question-external-id">السؤال ID</Label>
          <Input
            id="new-question-external-id"
            value="يتم توليده تلقائياً"
            disabled
            dir="ltr"
            autoFocus
            readOnly
          />
          <p className="mt-1.5 text-[10px] text-ink-soft/70">
            بيتحدد تلقائياً بناءً على أعلى ترتيب في المجموعة، ومش قابل للتعديل.
          </p>
        </div>

        <div>
          <Label htmlFor="new-question-text">
            نص السؤال <span className="text-danger-brand">*</span>
          </Label>
          <Textarea
            id="new-question-text"
            value={draft.text}
            onChange={(event) => setField("text", event.target.value)}
            maxLength={QUESTION_TEXT_MAX_LENGTH}
            rows={5}
            aria-invalid={fieldErrors.text ? true : undefined}
            aria-describedby={
              fieldErrors.text ? "new-question-text-error" : undefined
            }
            className="min-h-32"
          />
          {fieldErrors.text && (
            <p
              id="new-question-text-error"
              className="mt-1.5 text-[11px] font-bold text-danger-brand"
            >
              {fieldErrors.text}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="new-question-category">
              الفئة{" "}
              {setMeta.hasOptionalCategory ? (
                <span className="font-normal normal-case">(اختيارية)</span>
              ) : (
                <span className="text-danger-brand">*</span>
              )}
            </Label>
            <Select
              defaultValue={categories[0].category}
              onValueChange={(value) => setField("category", value)}
            >
              <SelectTrigger className={`w-full`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {categories.map((cat) => (
                  <SelectItem key={cat.category} value={cat.category}>
                    {cat.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {setMeta.hasCorrectAnswer && (
            <div>
              <Label htmlFor="new-question-answer">
                الإجابة الصحيحة <span className="text-danger-brand">*</span>
              </Label>
              <Input
                id="new-question-answer"
                value={draft.correctAnswer}
                onChange={(event) =>
                  setField("correctAnswer", event.target.value)
                }
                maxLength={QUESTION_CORRECT_ANSWER_MAX_LENGTH}
                aria-invalid={fieldErrors.correctAnswer ? true : undefined}
                aria-describedby={
                  fieldErrors.correctAnswer
                    ? "new-question-answer-error"
                    : undefined
                }
              />
              {fieldErrors.correctAnswer && (
                <p
                  id="new-question-answer-error"
                  className="mt-1.5 text-[11px] font-bold text-danger-brand"
                >
                  {fieldErrors.correctAnswer}
                </p>
              )}
            </div>
          )}

          {setMeta.hasBadgeLabel && (
            <div>
              <Label htmlFor="new-question-badge">
                الشارة{" "}
                <span className="font-normal normal-case">(اختيارية)</span>
              </Label>
              <Input
                id="new-question-badge"
                value={draft.badgeLabel}
                onChange={(event) => setField("badgeLabel", event.target.value)}
                maxLength={QUESTION_BADGE_LABEL_MAX_LENGTH}
                aria-invalid={fieldErrors.badgeLabel ? true : undefined}
                aria-describedby={
                  fieldErrors.badgeLabel
                    ? "new-question-badge-error"
                    : undefined
                }
              />
              {fieldErrors.badgeLabel && (
                <p
                  id="new-question-badge-error"
                  className="mt-1.5 text-[11px] font-bold text-danger-brand"
                >
                  {fieldErrors.badgeLabel}
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-[10px] leading-relaxed text-ink-soft/70">
          الإضافة بتكتب في Neon مباشرة. صفحات اللعبة الحالية لسه بتقرأ من ملفات
          المحتوى الثابتة، فمش هتتأثر بالسؤال الجديد لحد ما يتم تحديث الملفات.
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
            {isPending ? "جاري الإضافة..." : "إضافة السؤال"}
          </Button>
        </div>
      </form>
    </AppDialog>
  )
}
