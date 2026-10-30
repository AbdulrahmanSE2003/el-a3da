"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import { UploadIcon } from "lucide-react"
import { AppDialog } from "@/components/ui/AppDialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createQuestionsBulkAction } from "../server/question-actions"
import {
  BULK_MAX_PAYLOAD_BYTES,
  BULK_MAX_QUESTIONS,
  buildBulkTemplate,
  getBulkPayloadBytes,
  validateBulkPayload,
  type BulkDuplicateWarning,
  type BulkRowError,
} from "../lib/question-bulk"
import {
  formatCategoryOption,
  getCategoryLabel,
  getCategoryOptions,
} from "../lib/question-categories"
import type { CategoryCount, ContentSetMeta } from "../lib/types"

interface QuestionBulkDialogProps {
  setMeta: ContentSetMeta
  categories: CategoryCount[]
  onClose: () => void
  onCreated: () => void
}

const truncate = (value: string, length = 80) =>
  value.length > length ? `${value.slice(0, length)}…` : value

function ErrorList({
  errors,
  title,
}: {
  errors: readonly BulkRowError[]
  title: string
}) {
  if (errors.length === 0) return null

  return (
    <div className="rounded-xs border-2 border-danger-brand/40 bg-danger-brand/5 p-3">
      <p className="text-xs font-black text-danger-brand">
        {title} ({errors.length})
      </p>
      <ul className="mt-2 flex max-h-36 flex-col gap-1 overflow-y-auto text-[11px] leading-relaxed text-danger-brand">
        {errors.map((error, index) => (
          <li key={`${error.row}-${error.field}-${index}`}>
            <span className="font-mono font-bold">صف {error.row}:</span>{" "}
            {error.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

function WarningList({
  warnings,
}: {
  warnings: readonly BulkDuplicateWarning[]
}) {
  if (warnings.length === 0) return null

  return (
    <div className="rounded-xs border-2 border-copper/40 bg-copper/5 p-3">
      <p className="text-xs font-black text-copper">
        فيه أسئلة متكررة في الدفعة ({warnings.length})
      </p>
      <ul className="mt-2 flex max-h-28 flex-col gap-1 overflow-y-auto text-[11px] leading-relaxed text-ink-soft">
        {warnings.map((warning) => (
          <li key={`${warning.row}-${warning.firstRow}`}>
            السؤال في صف {warning.row} زي اللي في صف {warning.firstRow}:{" "}
            {truncate(warning.text)}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * إدخال مجمّع من JSON: لصق أو ملف، بنفس الـvalidation pipeline.
 * مفيش IDs أو positions هنا؛ السيرفر بيولّدهم في معاملة واحدة.
 */
export function QuestionBulkDialog({
  setMeta,
  categories,
  onClose,
  onCreated,
}: QuestionBulkDialogProps) {
  const categoryOptions = useMemo(
    () =>
      getCategoryOptions(
        setMeta,
        categories.map((category) => category.category)
      ),
    [categories, setMeta]
  )
  const categoryValues = useMemo(
    () => categoryOptions.map((option) => option.value),
    [categoryOptions]
  )

  const [raw, setRaw] = useState("")
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [serverRowErrors, setServerRowErrors] = useState<BulkRowError[]>([])
  const [successCount, setSuccessCount] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const submittingRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validation = useMemo(
    () => validateBulkPayload(raw, setMeta, categoryValues),
    [categoryValues, raw, setMeta]
  )

  const hasInput = raw.trim().length > 0
  const visibleRootError = hasInput || fileError ? validation.rootError : null

  const handleFile = async (file: File | undefined) => {
    if (!file) return

    setServerError(null)
    setServerRowErrors([])
    setFileError(null)

    if (file.size > BULK_MAX_PAYLOAD_BYTES) {
      setFileName(file.name)
      setFileError(
        `حجم الملف أكبر من الحد المسموح (${Math.round(
          BULK_MAX_PAYLOAD_BYTES / 1024
        )}KB).`
      )
      return
    }

    try {
      const text = await file.text()
      setFileName(file.name)
      setRaw(text)
    } catch {
      setFileError("مقدرناش نقرأ الملف. جرّب تاني.")
    }
  }

  const handleSubmit = () => {
    if (isPending || submittingRef.current || !validation.ok) return
    if (getBulkPayloadBytes(raw) > BULK_MAX_PAYLOAD_BYTES) return

    submittingRef.current = true
    setServerError(null)
    setServerRowErrors([])

    startTransition(async () => {
      try {
        const result = await createQuestionsBulkAction({
          setId: setMeta.id,
          json: raw,
        })

        if (!result.ok) {
          setServerError(result.error ?? "مقدرناش نضيف الأسئلة. جرّب تاني.")
          setServerRowErrors(result.rowErrors ?? [])
          return
        }

        setSuccessCount(result.count ?? validation.rows.length)
      } catch {
        setServerError("مقدرناش نضيف الأسئلة. جرّب تاني.")
      } finally {
        submittingRef.current = false
      }
    })
  }

  const insertTemplate = () => {
    setRaw(buildBulkTemplate(setMeta, categoryValues))
    setFileName(null)
    setFileError(null)
    setServerError(null)
    setServerRowErrors([])
  }

  const clear = () => {
    setRaw("")
    setFileName(null)
    setFileError(null)
    setServerError(null)
    setServerRowErrors([])
  }

  return (
    <AppDialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose()
      }}
      title="إضافة أسئلة مجمعة"
      subtitle={`${setMeta.title} · حد أقصى ${BULK_MAX_QUESTIONS} سؤال في المرة`}
      className="sm:max-w-3xl"
    >
      {successCount !== null ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-xs border-2 border-copper/40 bg-copper/10 p-4 text-sm font-bold text-copper">
            تمت إضافة {successCount} سؤال.
          </div>
          <p className="text-[11px] leading-relaxed text-ink-soft">
            الأسئلة بقيت جاهزة، وهتظهر للاعبين في الجلسات الجديدة. الجلسات اللي
            شغالة دلوقتي هتكمل بأسئلتها زي ما هي، مفيش تغيير عليها.
          </p>
          <div className="flex justify-end border-t border-ink/10 pt-4">
            <Button type="button" size="sm" onClick={onCreated}>
              تم
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-xs border border-ink/10 bg-paper-warm/50 p-3 text-[11px] leading-relaxed text-ink-soft">
            <p className="font-black text-ink">
              الإضافات اللي ممكن تقوليها لكل سؤال
            </p>
            <p className="mt-1 font-mono" dir="ltr">
              text, category
              {setMeta.hasCorrectAnswer ? ", correctAnswer" : ""}
              {setMeta.hasBadgeLabel ? ", badgeLabel" : ""}
            </p>
            <p className="mt-1">
              الفئة لازم تكون واحدة من الفئات الموجودة في المجموعة
              {setMeta.hasOptionalCategory ? "، أو ممكن تسيبها فاضية" : ""}.
              ومتقلقش من <span className="font-mono">id</span> أو{" "}
              <span className="font-mono">position</span> — النظام بيظبطهم لوحده
              من غير ما تتدخلي.
            </p>

            {categoryOptions.length > 0 && (
              <p className="mt-2">
                <span className="font-black text-ink">الفئات المتاحة:</span>{" "}
                {categoryOptions.map(formatCategoryOption).join("، ")}
              </p>
            )}

            {categoryOptions.length === 0 && !setMeta.hasOptionalCategory && (
              <p className="mt-2 font-bold text-copper">
                المجموعة دي لسه مفيش فيها فئات مسجلة. جرب تضيف سؤال واحد بفئة من
                واجهة الإضافة العادية الأول، وبعدين تقدر تيجي هنا وتستخدم
                الإضافة المجمعة براحتك.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={insertTemplate}
              disabled={isPending}
            >
              استخدم قالب جاهز
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              <UploadIcon className="size-4" />
              ارفع ملف JSON
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={(event) => {
                void handleFile(event.target.files?.[0])
                event.target.value = ""
              }}
            />

            {(hasInput || fileName) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clear}
                disabled={isPending}
              >
                مسح الكل
              </Button>
            )}

            {fileName && (
              <span className="font-mono text-[10px] text-ink-soft">
                {fileName}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="bulk-questions-json">
              الأسئلة <span className="text-danger-brand">*</span>
            </Label>
            <Textarea
              id="bulk-questions-json"
              value={raw}
              onChange={(event) => {
                setRaw(event.target.value)
                setFileName(null)
                setFileError(null)
                setServerError(null)
                setServerRowErrors([])
              }}
              rows={12}
              spellCheck={false}
              dir="ltr"
              placeholder={'[\n  { "text": "اكتب السؤال هنا" }\n]'}
              className="min-h-48 font-mono text-xs"
              aria-invalid={visibleRootError || serverError ? true : undefined}
            />
          </div>

          {visibleRootError && (
            <p
              role="alert"
              className="border-2 border-danger-brand/40 bg-danger-brand/10 px-3 py-2 text-xs font-bold text-danger-brand"
            >
              {visibleRootError}
            </p>
          )}

          {fileError && (
            <p
              role="alert"
              className="border-2 border-danger-brand/40 bg-danger-brand/10 px-3 py-2 text-xs font-bold text-danger-brand"
            >
              {fileError}
            </p>
          )}

          {hasInput && validation.ok && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold">
              <span className="text-ink">
                كل حاجة تمام — {validation.rows.length} سؤال جاهز للإضافة
              </span>
              <span className="text-ink-soft">
                {(getBulkPayloadBytes(raw) / 1024).toFixed(1)} /{" "}
                {Math.round(BULK_MAX_PAYLOAD_BYTES / 1024)} كيلوبايت
              </span>
            </div>
          )}

          <ErrorList errors={validation.errors} title="أخطاء محتاجة تصحيح" />
          <WarningList warnings={validation.warnings} />

          {serverError && (
            <p
              role="alert"
              className="border-2 border-danger-brand/40 bg-danger-brand/10 px-3 py-2 text-xs font-bold text-danger-brand"
            >
              {serverError}
            </p>
          )}

          <ErrorList errors={serverRowErrors} title="الصفوف دي فيها مشكلة" />

          {hasInput && validation.ok && (
            <div className="scrollbar-thumb-accent overflow-hidden rounded-xs border border-ink/10">
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-right text-[11px]">
                  <thead className="sticky top-0 bg-paper-warm text-ink-soft">
                    <tr>
                      <th className="px-2 py-1.5 font-black">#</th>
                      <th className="px-2 py-1.5 font-black">النص</th>
                      <th className="px-2 py-1.5 font-black">الفئة</th>
                      {setMeta.hasCorrectAnswer && (
                        <th className="px-2 py-1.5 font-black">الإجابة</th>
                      )}
                      {setMeta.hasBadgeLabel && (
                        <th className="px-2 py-1.5 font-black">الشارة</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {validation.rows.map((row, index) => (
                      <tr
                        key={`${index}-${row.text.slice(0, 20)}`}
                        className="border-t border-ink/10"
                      >
                        <td className="px-2 py-1.5 font-mono text-ink-soft">
                          {index + 1}
                        </td>
                        <td className="max-w-80 px-2 py-1.5 text-ink">
                          {truncate(row.text, 120)}
                        </td>
                        <td className="px-2 py-1.5 text-ink-soft">
                          {row.category
                            ? getCategoryLabel(setMeta.id, row.category)
                            : "—"}
                        </td>
                        {setMeta.hasCorrectAnswer && (
                          <td className="px-2 py-1.5 text-ink-soft">
                            {row.correctAnswer ?? "—"}
                          </td>
                        )}
                        {setMeta.hasBadgeLabel && (
                          <td className="px-2 py-1.5 text-ink-soft">
                            {row.badgeLabel ?? "—"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
              size="sm"
              onClick={handleSubmit}
              disabled={isPending || !validation.ok}
            >
              {isPending
                ? "بيتم إضافة الأسئلة..."
                : validation.ok
                  ? `إضافة ${validation.rows.length} سؤال`
                  : "إضافة الدفعة"}
            </Button>
          </div>
        </div>
      )}
    </AppDialog>
  )
}
