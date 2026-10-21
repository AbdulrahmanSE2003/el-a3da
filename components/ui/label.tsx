import * as React from "react"
import { cn } from "cn"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      data-slot="label"
      className={cn(
        "mb-1.5 block font-mono text-[10px] font-bold tracking-widest text-ink-soft",
        className
      )}
      {...props}
    />
  )
}

export { Label }
