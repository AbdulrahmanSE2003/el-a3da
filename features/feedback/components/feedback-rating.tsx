"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedbackRatingProps {
  value: number | null
  onChange: (value: number | null) => void
}

export function FeedbackRating({ value, onChange }: FeedbackRatingProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-ink-soft">
        انبسطت مع القعدة؟ (اختياري){" "}
      </legend>

      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = value !== null && star <= value

          return (
            <button
              key={star}
              type="button"
              aria-pressed={value === star}
              aria-label={`${star} من 5`}
              onClick={() => onChange(value === star ? null : star)}
              className="rounded-md border-2 border-ink/20 bg-paper p-2 text-ink-soft transition-all outline-none hover:border-ink/50 focus-visible:ring-[3px] focus-visible:ring-copper/50 aria-pressed:border-ink"
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

        {value !== null && (
          <span className="ms-1 font-mono text-xs font-bold text-copper">
            {value}/5
          </span>
        )}
      </div>
    </fieldset>
  )
}
