"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ar } from "date-fns/locale"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "cn"

/**
 * تقويم shadcn — مبني على react-day-picker v10، بالعربي واتجاه RTL،
 * وبنفس لغة التصميم (حدود سميكة وظل صلب).
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={ar}
      dir="rtl"
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col gap-2 sm:flex-row",
        month: "flex flex-col gap-3",
        month_caption: "relative flex h-8 items-center justify-center",
        caption_label: "text-sm font-black text-ink",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous:
          "inline-flex size-7 items-center justify-center rounded-sm border-2 border-ink bg-paper text-ink transition-colors hover:bg-paper-warm focus-visible:ring-[3px] focus-visible:ring-copper/50 focus-visible:outline-none disabled:opacity-40",
        button_next:
          "inline-flex size-7 items-center justify-center rounded-sm border-2 border-ink bg-paper text-ink transition-colors hover:bg-paper-warm focus-visible:ring-[3px] focus-visible:ring-copper/50 focus-visible:outline-none disabled:opacity-40",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-8 rounded-sm font-mono text-[10px] font-bold text-ink-soft/70",
        week: "mt-1 flex w-full",
        day: "relative size-8 p-0 text-center text-sm",
        day_button:
          "inline-flex size-8 items-center justify-center rounded-sm border-2 border-transparent font-mono text-xs font-bold text-ink transition-colors hover:border-ink/30 hover:bg-paper-warm focus-visible:ring-[3px] focus-visible:ring-copper/50 focus-visible:outline-none",
        selected:
          "[&>button]:border-ink [&>button]:bg-ink [&>button]:text-paper [&>button]:shadow-[2px_2px_0px_0px_var(--color-copper)] [&>button:hover]:bg-ink",
        today: "[&>button]:border-copper/60 [&>button]:text-copper",
        outside: "opacity-40",
        disabled: "opacity-25",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className="size-4" {...chevronProps} />
          ) : (
            <ChevronRightIcon className="size-4" {...chevronProps} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
