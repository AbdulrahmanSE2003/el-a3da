"use client"

import { useState } from "react"
import { LoaderCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FEEDBACK_MESSAGE_MAX_LENGTH,
  FEEDBACK_MAX_FILE_BYTES,
  FEEDBACK_MAX_FILES,
  validateFeedbackDraft,
  validateFeedbackFiles,
  type FeedbackFieldErrors,
  type FeedbackType,
} from "../lib/feedback"
import { FeedbackTypeSelector } from "./feedback-type-selector"
import { FeedbackRating } from "./feedback-rating"
import { FeedbackContextFields } from "./feedback-context-fields"
import {
  FeedbackImageUpload,
  type SelectedImage,
} from "./feedback-image-upload"
import { FeedbackSuccess } from "./feedback-success"

type Stage = "idle" | "sending" | "uploading" | "success"

function getClientDeviceInfo(): string {
  if (typeof window === "undefined") return ""

  return [
    `${window.innerWidth}x${window.innerHeight}`,
    navigator.language,
    window.matchMedia("(display-mode: standalone)").matches
      ? "standalone"
      : "browser",
  ]
    .filter(Boolean)
    .join(" · ")
}

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

  const busy = stage === "sending" || stage === "uploading"

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
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (busy) return

    setFieldErrors({})
    setFormError(null)
    setFileError(null)

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
      images.map(({ file }) => ({
        name: file.name,
        type: file.type,
        size: file.size,
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
        if (startData?.fieldErrors) {
          setFieldErrors(startData.fieldErrors)
        }

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
          .catch(() => null)) as {
          ok?: boolean
          error?: string
        } | null

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
    return <FeedbackSuccess onReset={resetForm} />
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={busy}
      className="relative flex flex-col gap-6 rounded-md border-2 border-ink bg-paper-warm p-4 shadow-[6px_6px_0_var(--color-ink)] sm:p-5"
    >
      {/* Honeypot */}
      <div
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
        aria-hidden="true"
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

      <FeedbackTypeSelector value={type} onChange={setType} />

      <div>
        <Label htmlFor="feedback-message">رسالتك</Label>

        <Textarea
          id="feedback-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="اكتب تفاصيل واضحة، ولو المشكلة بتتكرر قولنا إمتى بتحصل..."
          maxLength={FEEDBACK_MESSAGE_MAX_LENGTH}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={
            fieldErrors.message ? "feedback-message-error" : undefined
          }
          className="min-h-32 resize-none"
        />

        <div className="mt-1 flex items-center justify-between text-[10px] font-bold">
          <span id="feedback-message-error" className="text-danger-brand">
            {fieldErrors.message ?? ""}
          </span>

          <span className="font-mono text-ink-soft/60">
            {message.length}/{FEEDBACK_MESSAGE_MAX_LENGTH}
          </span>
        </div>
      </div>

      <FeedbackRating value={rating} onChange={setRating} />

      <FeedbackContextFields
        contact={contact}
        onContactChange={setContact}
        setId={setId}
        onSetIdChange={setSetId}
        questionExternalId={questionExternalId}
        onQuestionExternalIdChange={setQuestionExternalId}
        fieldErrors={fieldErrors}
      />

      <FeedbackImageUpload
        images={images}
        setImages={setImages}
        fileError={fileError}
        setFileError={setFileError}
        disabled={busy}
      />

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
            <LoaderCircle className="size-4 animate-spin" />
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
