"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FEEDBACK_SET_OPTIONS, type FeedbackFieldErrors } from "../lib/feedback"

interface FeedbackContextFieldsProps {
  contact: string
  onContactChange: (value: string) => void
  setId: string
  onSetIdChange: (value: string) => void
  questionExternalId: string
  onQuestionExternalIdChange: (value: string) => void
  fieldErrors: FeedbackFieldErrors
}

export function FeedbackContextFields({
  contact,
  onContactChange,
  setId,
  onSetIdChange,
  questionExternalId,
  onQuestionExternalIdChange,
  fieldErrors,
}: FeedbackContextFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="feedback-contact">نوصلك إزاي؟ (اختياري)</Label>

        <Input
          className={`rounded-md`}
          id="feedback-contact"
          value={contact}
          onChange={(event) => onContactChange(event.target.value)}
          placeholder="إيميل، تليجرام، أو رقم"
          maxLength={200}
          aria-invalid={Boolean(fieldErrors.contact)}
          aria-describedby={
            fieldErrors.contact ? "feedback-contact-error" : undefined
          }
          dir="auto"
        />

        {fieldErrors.contact && (
          <p
            id="feedback-contact-error"
            className="mt-1 text-[10px] font-bold text-danger-brand"
          >
            {fieldErrors.contact}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="feedback-set">اللعبة/المجموعة (اختياري)</Label>

          <Select value={setId} onValueChange={onSetIdChange}>
            <SelectTrigger
              id="feedback-set"
              aria-label="اختيار المجموعة"
              className="mt-1.5 w-full"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent position="popper">
              <SelectItem value="none">مش مرتبطة بـ لعبة معينة</SelectItem>

              {FEEDBACK_SET_OPTIONS.map((set) => (
                <SelectItem key={set.id} value={set.id}>
                  {set.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="feedback-question"> رقم السؤال (لو فاكره)</Label>

          <Input
            className={`rounded-md`}
            id="feedback-question"
            value={questionExternalId}
            onChange={(event) => onQuestionExternalIdChange(event.target.value)}
            placeholder="مثال: 12 أو 3-4"
            maxLength={100}
            aria-invalid={Boolean(fieldErrors.questionExternalId)}
            aria-describedby={
              fieldErrors.questionExternalId
                ? "feedback-question-error"
                : undefined
            }
            dir="ltr"
          />

          {fieldErrors.questionExternalId && (
            <p
              id="feedback-question-error"
              className="mt-1 text-[10px] font-bold text-danger-brand"
            >
              {fieldErrors.questionExternalId}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
