"use client"

import { Bug, CircleHelp, Lightbulb, MessageCircle } from "lucide-react"
import {
  FEEDBACK_TYPE_DESCRIPTIONS,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_TYPES,
  type FeedbackType,
} from "../lib/feedback"
import { cn } from "@/lib/utils"

const TYPE_ICONS: Record<FeedbackType, typeof Bug> = {
  general: MessageCircle,
  bug: Bug,
  suggestion: Lightbulb,
  question_issue: CircleHelp,
}

interface FeedbackTypeSelectorProps {
  value: FeedbackType
  onChange: (value: FeedbackType) => void
}

export function FeedbackTypeSelector({
  value,
  onChange,
}: FeedbackTypeSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-ink-soft">
        عايز تقولنا إيه؟{" "}
      </legend>

      <div className="grid grid-cols-2 gap-2">
        {FEEDBACK_TYPES.map((item) => {
          const Icon = TYPE_ICONS[item]
          const active = value === item

          return (
            <button
              key={item}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(item)}
              className={cn(
                "flex flex-col items-start gap-1.5 rounded-md border-2 p-3 text-start transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-copper/50",
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
  )
}
