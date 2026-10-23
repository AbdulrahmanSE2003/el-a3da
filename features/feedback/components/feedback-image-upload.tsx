"use client"

import { useEffect, useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import {
  FEEDBACK_ACCEPT,
  FEEDBACK_MAX_FILES,
  FEEDBACK_MAX_FILE_BYTES,
  isFeedbackMimeType,
} from "../lib/feedback"
import { cn } from "@/lib/utils"

export interface SelectedImage {
  id: string
  file: File
  previewUrl: string
}

interface FeedbackImageUploadProps {
  images: SelectedImage[]
  setImages: React.Dispatch<React.SetStateAction<SelectedImage[]>>
  fileError: string | null
  setFileError: (error: string | null) => void
  disabled?: boolean
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`

export function FeedbackImageUpload({
  images,
  setImages,
  fileError,
  setFileError,
  disabled = false,
}: FeedbackImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef(images)

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl)
      )
    }
  }, [])
  const addFiles = (list: FileList | null) => {
    if (!list?.length) return

    setFileError(null)

    const accepted: SelectedImage[] = []
    let error: string | null = null
    let available = Math.max(0, FEEDBACK_MAX_FILES - images.length)

    for (const file of Array.from(list)) {
      if (available <= 0) {
        error = `الحد الأقصى ${FEEDBACK_MAX_FILES} صور.`
        break
      }

      if (!isFeedbackMimeType(file.type)) {
        error = "الصور المسموحة: PNG أو JPG أو WebP."
        continue
      }

      if (file.size > FEEDBACK_MAX_FILE_BYTES) {
        error = `كل صورة لازم تكون ${Math.round(
          FEEDBACK_MAX_FILE_BYTES / (1024 * 1024)
        )} ميجا أو أقل.`
        continue
      }

      accepted.push({
        id: createId(),
        file,
        previewUrl: URL.createObjectURL(file),
      })

      available -= 1
    }

    if (accepted.length) {
      setImages((current) => {
        const remaining = Math.max(0, FEEDBACK_MAX_FILES - current.length)
        const added = accepted.slice(0, remaining)

        for (const image of accepted.slice(remaining)) {
          URL.revokeObjectURL(image.previewUrl)
        }

        return [...current, ...added]
      })
    }

    if (error) setFileError(error)
  }

  const removeImage = (id: string) => {
    const target = images.find((image) => image.id === id)
    if (!target) return

    URL.revokeObjectURL(target.previewUrl)
    setImages((current) => current.filter((image) => image.id !== id))
    setFileError(null)
  }

  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-ink-soft">
        لقطة شاشة (لو عايز توضح){" "}
      </p>

      <input
        ref={inputRef}
        id="feedback-images"
        type="file"
        accept={FEEDBACK_ACCEPT}
        multiple
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files)
          event.target.value = ""
        }}
      />

      <label
        htmlFor="feedback-images"
        className={cn(
          "flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-ink/30 bg-paper px-4 py-5 text-xs font-bold text-ink-soft transition-colors",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:border-copper hover:text-copper"
        )}
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
                disabled={disabled}
                onClick={() => removeImage(image.id)}
                aria-label="حذف الصورة"
                className="absolute -inset-e-2 -top-2 flex size-6 items-center justify-center border-2 border-ink bg-danger-brand text-paper disabled:opacity-50"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {fileError && (
        <p
          role="alert"
          className="mt-2 text-[10px] font-bold text-danger-brand"
        >
          {fileError}
        </p>
      )}
    </div>
  )
}
