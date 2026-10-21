import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles: Layout, typography, states (بدون ألوان أو ظلال هنا)
        "min-h-24 w-full min-w-0 rounded-sm border-2 border-ink bg-paper px-4 py-3 text-base font-bold text-ink shadow-[4px_4px_0px_0px_var(--color-ink)] transition-all duration-200 outline-none select-none placeholder:text-ink-soft/60 hover:bg-paper-warm focus-visible:bg-paper focus-visible:shadow-[2px_2px_0px_0px_var(--color-ink)] focus-visible:ring-[3px] focus-visible:ring-copper/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-brand aria-invalid:shadow-[4px_4px_0px_0px_var(--color-danger-brand)] aria-invalid:ring-[3px] aria-invalid:ring-danger-brand/30 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
