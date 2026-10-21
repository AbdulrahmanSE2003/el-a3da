"use client"

import * as React from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { CalendarIcon, XIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "cn"

interface DatePickerProps {
  id?: string
  /** بصيغة YYYY-MM-DD أو فاضي */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean
}

/** منتقي تاريخ shadcn (Popover + Calendar) بصيغة ISO محلية YYYY-MM-DD */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "اختر التاريخ",
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const date = React.useMemo(() => {
    if (!value) return undefined
    const parsed = new Date(`${value}T00:00:00`)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }, [value])

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-haspopup="dialog"
            className={cn(
              "flex h-12 w-full min-w-0 items-center gap-2 rounded-sm border-2 border-ink bg-paper px-4 pe-9 text-start text-base font-bold text-ink shadow-[4px_4px_0px_0px_var(--color-ink)] transition-all duration-200 outline-none select-none hover:bg-paper-warm focus-visible:translate-x-0.5 focus-visible:translate-y-0.5 focus-visible:bg-paper focus-visible:shadow-[2px_2px_0px_0px_var(--color-ink)] focus-visible:ring-[3px] focus-visible:ring-copper/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-brand aria-invalid:shadow-[4px_4px_0px_0px_var(--color-danger-brand)] md:text-sm",
              !date && "text-ink-soft/60"
            )}
          >
            <CalendarIcon className="size-4 shrink-0 text-ink-soft" />
            <span className="truncate">
              {date ? format(date, "d MMMM yyyy", { locale: ar }) : placeholder}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            onSelect={(next) => {
              if (!next) {
                onChange("")
              } else {
                onChange(format(next, "yyyy-MM-dd"))
              }
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>

      {date && !disabled && (
        <button
          type="button"
          aria-label="مسح التاريخ"
          onClick={() => onChange("")}
          className="absolute end-2.5 top-1/2 -translate-y-1/2 text-ink-soft transition-colors hover:text-ink focus-visible:ring-[3px] focus-visible:ring-copper/50 focus-visible:outline-none"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}
