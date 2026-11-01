"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
    const handleClick = () => {
      if (disabled) return
      onCheckedChange?.(!checked)
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        id={id}
        className={cn(
          "inline-flex items-center justify-center cursor-pointer rounded-full border-2 border-ink transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 size-9",
          checked ? "bg-copper" : "bg-paper",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "block w-4 h-4 rounded-full bg-ink shadow-[2px_2px_0_0_rgba(0,0,0,0.25)] transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }
