"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  QUESTION_BADGE_LABEL_MAX_LENGTH,
  QUESTION_CORRECT_ANSWER_MAX_LENGTH,
  QUESTION_TEXT_MAX_LENGTH,
  type QuestionDraft,
  type QuestionField,
  type QuestionFieldErrors,
} from "../lib/question-form"
import { getCategoryLabel } from "../lib/question-categories"
import type { ContentSetMeta } from "../lib/types"

/** قيمة داخلية لخيار "بدون فئة" لأن Radix Select مابيسمحش بقيمة فاضية. */
const NO_CATEGORY_VALUE = "__none__"

interface QuestionFormFieldsProps {
  /** بادئة IDs الحقول عشان مفيش تعارض بين الإضافة والتعديل. */
  idPrefix: string
  draft: QuestionDraft
  setMeta: ContentSetMeta
  categoryOptions: readonly string[]
  fieldErrors: QuestionFieldErrors
  onChange: (field: QuestionField, value: string) => void
  autoFocus?: boolean
}

/**
 * حقول السؤال المشتركة بين الإضافة والتعديل.
 * الفئة بتختار من قائمة الفئات الموجودة بدل إدخال حر.
 */
export function QuestionFormFields({
  idPrefix,
  draft,
  setMeta,
  categoryOptions,
  fieldErrors,
  onChange,
  autoFocus = false,
}: QuestionFormFieldsProps) {
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          [...categoryOptions, draft.category]
            .map((category) => category.trim())
            .filter(Boolean)
        )
      ),
    [categoryOptions, draft.category]
  )

  const categoryValue = draft.category
    ? draft.category
    : setMeta.hasOptionalCategory
      ? NO_CATEGORY_VALUE
      : ""

  const hasCategoryOptions = categories.length > 0

  return (
    <>
      <div>
        <Label htmlFor={`${idPrefix}-text`}>
          نص السؤال <span className="text-danger-brand">*</span>
        </Label>
        <Textarea
          id={`${idPrefix}-text`}
          value={draft.text}
          onChange={(event) => onChange("text", event.target.value)}
          maxLength={QUESTION_TEXT_MAX_LENGTH}
          rows={5}
          autoFocus={autoFocus}
          placeholder="اكتب السؤال هنا..."
          aria-invalid={fieldErrors.text ? true : undefined}
          aria-describedby={
            fieldErrors.text ? `${idPrefix}-text-error` : undefined
          }
          className="min-h-32"
        />
        {fieldErrors.text && (
          <p
            id={`${idPrefix}-text-error`}
            className="mt-1.5 text-[11px] font-bold text-danger-brand"
          >
            {fieldErrors.text}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${idPrefix}-category`}>
            الفئة{" "}
            {setMeta.hasOptionalCategory ? (
              <span className="font-normal normal-case">(اختيارية)</span>
            ) : (
              <span className="text-danger-brand">*</span>
            )}
          </Label>
          <Select
            value={categoryValue}
            onValueChange={(value) =>
              onChange("category", value === NO_CATEGORY_VALUE ? "" : value)
            }
          >
            <SelectTrigger
              id={`${idPrefix}-category`}
              className="w-full"
              disabled={!hasCategoryOptions && !setMeta.hasOptionalCategory}
              aria-invalid={fieldErrors.category ? true : undefined}
              aria-describedby={
                fieldErrors.category ? `${idPrefix}-category-error` : undefined
              }
            >
              <SelectValue
                placeholder={
                  hasCategoryOptions ? "اختار الفئة..." : "مفيش فئات متاحة"
                }
              />
            </SelectTrigger>

            <SelectContent position="popper">
              {setMeta.hasOptionalCategory && (
                <SelectItem value={NO_CATEGORY_VALUE}>بدون فئة</SelectItem>
              )}

              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {getCategoryLabel(setMeta.id, category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.category && (
            <p
              id={`${idPrefix}-category-error`}
              className="mt-1.5 text-[11px] font-bold text-danger-brand"
            >
              {fieldErrors.category}
            </p>
          )}
        </div>

        {setMeta.hasCorrectAnswer && (
          <div>
            <Label htmlFor={`${idPrefix}-answer`}>
              الإجابة الصحيحة <span className="text-danger-brand">*</span>
            </Label>
            <Input
              id={`${idPrefix}-answer`}
              value={draft.correctAnswer}
              onChange={(event) =>
                onChange("correctAnswer", event.target.value)
              }
              maxLength={QUESTION_CORRECT_ANSWER_MAX_LENGTH}
              placeholder="اكتب الإجابة الصحيحة..."
              aria-invalid={fieldErrors.correctAnswer ? true : undefined}
              aria-describedby={
                fieldErrors.correctAnswer
                  ? `${idPrefix}-answer-error`
                  : undefined
              }
            />
            {fieldErrors.correctAnswer && (
              <p
                id={`${idPrefix}-answer-error`}
                className="mt-1.5 text-[11px] font-bold text-danger-brand"
              >
                {fieldErrors.correctAnswer}
              </p>
            )}
          </div>
        )}

        {setMeta.hasBadgeLabel && (
          <div>
            <Label htmlFor={`${idPrefix}-badge`}>
              الشارة <span className="font-normal normal-case">(اختيارية)</span>
            </Label>
            <Input
              id={`${idPrefix}-badge`}
              value={draft.badgeLabel}
              onChange={(event) => onChange("badgeLabel", event.target.value)}
              maxLength={QUESTION_BADGE_LABEL_MAX_LENGTH}
              placeholder="مثال: زاد القعدة"
              aria-invalid={fieldErrors.badgeLabel ? true : undefined}
              aria-describedby={
                fieldErrors.badgeLabel ? `${idPrefix}-badge-error` : undefined
              }
            />
            {fieldErrors.badgeLabel ? (
              <p
                id={`${idPrefix}-badge-error`}
                className="mt-1.5 text-[11px] font-bold text-danger-brand"
              >
                {fieldErrors.badgeLabel}
              </p>
            ) : (
              <p className="mt-1.5 text-[10px] leading-relaxed text-ink-soft/70">
                بتظهر على كارت السؤال في اللعبة.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
