"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bug,
  CheckCircle2,
  CircleHelp,
  ImagePlus,
  Lightbulb,
  MessageCircle,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FEEDBACK_ACCEPT,
  FEEDBACK_MESSAGE_MAX_LENGTH,
  FEEDBACK_SET_OPTIONS,
  FEEDBACK_TYPE_DESCRIPTIONS,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_TYPES,
  FEEDBACK_MAX_FILES,
  FEEDBACK_MAX_FILE_BYTES,
  isFeedbackMimeType,
  validateFeedbackDraft,
  validateFeedbackFiles,
  type FeedbackFieldErrors,
  type FeedbackType,
} from "../lib/feedback"
import { cn } from "@/lib/utils"

interface SelectedImage {
  id: string
  file: File
  previewUrl: string
}

type Stage = "idle" | "sending" | "uploading" | "success"

const TYPE_ICONS: Record<FeedbackType, typeof Bug> = {
  general: MessageCircle,
  bug: Bug,
  suggestion: Lightbulb,
  question_issue: CircleHelp,
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

function getClientDeviceInfo(): string {
  if (typeof window === "undefined") return ""
  const parts = [
    `${window.innerWidth}x${window.innerHeight}`,
    navigator.language,
    window.matchMedia("(display-mode: standalone)").matches
      ? "standalone"
      : "browser",
  ]
  return parts.filter(Boolean).join(" · ")
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`

export function FeedbackForm() {
  const [type, setType] = useState<FeedbackType>("general")
  const [message, setMessage] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [contact, setContact] = useState("")
  const [setId, setSetId] = useState("none")
  const [questionExternalId, setQuestionExternalId] = useState("")
  const [website, setWebsite] = useState("")

  const [images, setImages] = useState<SelectedImage[]>([])
  const [fileError, setFileError] = useState<string | null>(null)

  const [fieldErrors, setFieldErrors] = useState<FeedbackFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>("idle")

  const imagesRef = useRef<SelectedImage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(
    () => () => {
      imagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl)
      )
    },
    []
  )

  const busy = stage === "sending" || stage === "uploading"

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return
    setFileError(null)

    const accepted: SelectedImage[] = []
    for (const file of Array.from(list)) {
      if (images.length + accepted.length >= FEEDBACK_MAX_FILES) {
        setFileError(`الحد الأقصى ${FEEDBACK_MAX_FILES} صور.`)
        break
      }
      if (!isFeedbackMimeType(file.type)) {
        setFileError("الصور المسموحة: PNG أو JPG أو WebP.")
        continue
      }
      if (file.size > FEEDBACK_MAX_FILE_BYTES) {
        setFileError(
          `كل صورة لازم تكون ${Math.round(
            FEEDBACK_MAX_FILE_BYTES / (1024 * 1024)
          )} ميجا أو أقل.`
        )
        continue
      }
      accepted.push({
        id: createId(),
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }

    if (accepted.length > 0) setImages((current) => [...current, ...accepted])
  }

  const removeImage = (id: string) => {
    setImages((current) => {
      const target = current.find((image) => image.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return current.filter((image) => image.id !== id)
    })
  }

  const resetForm = () => {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    setImages([])
    setMessage("")
    setRating(null)
    setContact("")
    setSetId("none")
    setQuestionExternalId("")
    setType("general")
    setWebsite("")
    setFieldErrors({})
    setFormError(null)
    setFileError(null)
    setStage("idle")
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return

    setFieldErrors({})
    setFormError(null)

    const validation = validateFeedbackDraft({
      type,
      message,
      rating,
      contact,
      setId,
      questionExternalId,
      deviceInfo: "",
    })
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors)
      setFormError("راجع البيانات المعلّمة وجرّب تاني.")
      return
    }

    const filesValidation = validateFeedbackFiles(
      images.map((image) => ({
        name: image.file.name,
        type: image.file.type,
        size: image.file.size,
      }))
    )
    if (!filesValidation.ok) {
      setFileError(filesValidation.error)
      return
    }

    setStage("sending")

    try {
      const startResponse = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validation.value,
          website,
          deviceInfo: getClientDeviceInfo(),
          files: filesValidation.value,
        }),
      })
      const startData = (await startResponse.json().catch(() => null)) as {
        ok?: boolean
        error?: string
        fieldErrors?: FeedbackFieldErrors
        pending?: boolean
        token?: string
        uploads?: Array<{
          key: string
          url: string
          method: string
          headers?: Record<string, string>
        }>
      } | null

      if (!startResponse.ok || !startData?.ok) {
        if (startData?.fieldErrors) setFieldErrors(startData.fieldErrors)
        setFormError(startData?.error ?? "حصلت مشكلة. جرّب تاني.")
        setStage("idle")
        return
      }

      if (startData.pending && startData.token) {
        setStage("uploading")
        const uploads = startData.uploads ?? []
        if (uploads.length !== images.length) {
          setFormError("حصلت مشكلة في تجهيز الصور. جرّب تاني.")
          setStage("idle")
          return
        }

        for (let index = 0; index < uploads.length; index += 1) {
          const upload = uploads[index]
          const image = images[index]
          const uploadResponse = await fetch(upload.url, {
            method: upload.method || "PUT",
            headers: upload.headers,
            body: image.file,
          })
          if (!uploadResponse.ok) {
            setFormError("فشل رفع إحدى الصور. جرّب تاني.")
            setStage("idle")
            return
          }
        }

        const completeResponse = await fetch("/api/feedback/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: startData.token }),
        })
        const completeData = (await completeResponse
          .json()
          .catch(() => null)) as { ok?: boolean; error?: string } | null

        if (!completeResponse.ok || !completeData?.ok) {
          setFormError(completeData?.error ?? "حصلت مشكلة. جرّب تاني.")
          setStage("idle")
          return
        }
      }

      setStage("success")
    } catch {
      setFormError("تعذر الاتصال. اتأكد من الإنترنت وجرّب تاني.")
      setStage("idle")
    }
  }

  if (stage === "success") {
    return (
      <section className="border-2 border-ink bg-paper-warm p-6 text-center shadow-[6px_6px_0_var(--color-ink)]">
        <span className="mx-auto flex size-14 items-center justify-center border-2 border-ink bg-copper text-paper shadow-[3px_3px_0_var(--color-ink)]">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-4 text-xl font-black text-ink">وصلتنا رسالتك</h2>
        <p className="mt-2 text-xs leading-6 font-semibold text-ink-soft">
          شكرًا إنك ساعدتنا نخلي القعدة أحلى. الرسالة وصلت لفريق المطوّر، ولو
          حطيت بيانات تواصل ممكن نرد عليك.
        </p>
        <Button className="mt-5 w-full" onClick={resetForm}>
          ابعت رسالة تانية
        </Button>
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={busy}
      className="relative flex flex-col gap-6 border-2 border-ink bg-paper-warm p-4 shadow-[6px_6px_0_var(--color-ink)] sm:p-5"
    >
      {/* Honeypot — مخفي عن المستخدم */}
      <div
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        aria-hidden
      >
        <label>
          موقعك
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>
      </div>

      {/* نوع الملاحظة */}
      <fieldset>
        <legend className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-ink-soft">
          نوع الملاحظة
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {FEEDBACK_TYPES.map((item) => {
            const Icon = TYPE_ICONS[item]
            const active = type === item
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setType(item)}
                className={cn(
                  "flex flex-col items-start gap-1.5 border-2 p-3 text-start transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-copper/50",
                  active
                    ? "border-ink bg-ink text-paper shadow-[3px_3px_0_var(--color-ink)]"
                    : "border-ink/20 bg-paper text-ink hover:border-ink/50"
                )}
              >
                <Icon className={cn("size-4", active && "text-copper")} />
                <span className="text-xs font-black">
                  {FEEDBACK_TYPE_LABELS[item]}
                </span>
                <span
                  className={cn(
                    "text-[10px] leading-4",
                    active ? "text-paper/70" : "text-ink-soft/70"
                  )}
                >
                  {FEEDBACK_TYPE_DESCRIPTIONS[item]}
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* الرسالة */}
      <div>
        <Label htmlFor="feedback-message">رسالتك</Label>
        <Textarea
          id="feedback-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="اكتب تفاصيل واضحة، ولو المشكلة بتتكرر قولنا إمتى بتحصل..."
          maxLength={FEEDBACK_MESSAGE_MAX_LENGTH}
          aria-invalid={Boolean(fieldErrors.message)}
          className="min-h-32 resize-none"
        />
        <div className="mt-1 flex items-center justify-between text-[10px] font-bold">
          <span className="text-danger-brand">{fieldErrors.message ?? ""}</span>
          <span className="font-mono text-ink-soft/60">
            {message.length}/{FEEDBACK_MESSAGE_MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* التقييم */}
      <div>
        <p className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-ink-soft">
          تقييم التجربة (اختياري)
        </p>
        <div
          role="radiogroup"
          aria-label="تقييم التجربة"
          className="flex items-center gap-1.5"
        >
          {[1, 2, 3, 4, 5].map((value) => {
            const active = rating !== null && value <= rating
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} من 5`}
                onClick={() => setRating(rating === value ? null : value)}
                className="border-2 border-ink/20 bg-paper p-2 text-ink-soft transition-all outline-none hover:border-ink/50 focus-visible:ring-[3px] focus-visible:ring-copper/50 aria-checked:border-ink"
              >
                <Star
                  className={cn(
                    "size-5",
                    active ? "fill-copper text-copper" : "text-ink-soft/40"
                  )}
                />
              </button>
            )
          })}
          {rating && (
            <span className="ms-1 font-mono text-xs font-bold text-copper">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      {/* التواصل */}
      <div>
        <Label htmlFor="feedback-contact">وسيلة تواصل (اختياري)</Label>
        <Input
          id="feedback-contact"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="إيميل، تليجرام، أو رقم"
          maxLength={200}
          aria-invalid={Boolean(fieldErrors.contact)}
          dir="auto"
        />
        {fieldErrors.contact && (
          <p className="mt-1 text-[10px] font-bold text-danger-brand">
            {fieldErrors.contact}
          </p>
        )}
      </div>

      {/* مرتبط بسؤال؟ */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-ink-soft">
            اللعبة/المجموعة (اختياري)
          </p>
          <Select value={setId} onValueChange={setSetId}>
            <SelectTrigger aria-label="اختيار المجموعة" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="none">غير مرتبط بمجموعة</SelectItem>
              {FEEDBACK_SET_OPTIONS.map((set) => (
                <SelectItem key={set.id} value={set.id}>
                  {set.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="feedback-question">معرّف السؤال (اختياري)</Label>
          <Input
            id="feedback-question"
            value={questionExternalId}
            onChange={(event) => setQuestionExternalId(event.target.value)}
            placeholder="مثال: 12 أو 3-4"
            maxLength={100}
            aria-invalid={Boolean(fieldErrors.questionExternalId)}
            dir="ltr"
          />
        </div>
      </div>

      {/* الصور */}
      <div>
        <p className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-ink-soft">
          صور الشاشة (اختياري)
        </p>

        <input
          ref={inputRef}
          id="feedback-images"
          type="file"
          accept={FEEDBACK_ACCEPT}
          multiple
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ""
          }}
        />

        <label
          htmlFor="feedback-images"
          className="flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-ink/30 bg-paper px-4 py-5 text-xs font-bold text-ink-soft transition-colors hover:border-copper hover:text-copper"
        >
          <ImagePlus className="size-4" />
          اختار صور من جهازك (حتى {FEEDBACK_MAX_FILES} صور)
        </label>

        {images.length > 0 && (
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {images.map((image) => (
              <li
                key={image.id}
                className="relative border-2 border-ink bg-paper"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.previewUrl}
                  alt={image.file.name}
                  className="h-20 w-full object-cover"
                />
                <span className="block border-t border-ink/10 px-1.5 py-1 font-mono text-[9px] text-ink-soft">
                  {formatSize(image.file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  aria-label="حذف الصورة"
                  className="absolute -inset-e-2 -top-2 flex size-6 items-center justify-center border-2 border-ink bg-danger-brand text-paper"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {fileError && (
          <p className="mt-2 text-[10px] font-bold text-danger-brand">
            {fileError}
          </p>
        )}
      </div>

      {formError && (
        <p
          role="alert"
          className="border-2 border-danger-brand/40 bg-danger-brand/10 px-3 py-2 text-xs font-bold text-danger-brand"
        >
          {formError}
        </p>
      )}

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? (
          <>
            <Trash2 className="size-4 animate-pulse" />
            {stage === "uploading" ? "جاري رفع الصور..." : "جاري الإرسال..."}
          </>
        ) : (
          <>
            <Send className="size-4" />
            ابعت الملاحظة
          </>
        )}
      </Button>

      <p className="text-center text-[10px] leading-5 text-ink-soft/70">
        الصور بتترفع على تخزين خاص ومحدش بيشوفها غير فريق المطوّر.
      </p>
    </form>
  )
}
