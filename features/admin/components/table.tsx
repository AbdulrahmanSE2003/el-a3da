"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

/** جدول مضغوط للاستخدام الإداري — بيتحط في حاوية overflow-x-auto */
function AdminTable({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn(
          "w-full min-w-[640px] border-collapse text-start text-sm",
          className
        )}
        {...props}
      />
    </div>
  )
}

function AdminTHead({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      className={cn("border-b-2 border-ink bg-paper-warm", className)}
      {...props}
    />
  )
}

function AdminTR({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-ink/10 transition-colors hover:bg-copper/5",
        className
      )}
      {...props}
    />
  )
}

function AdminTH({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-2.5 text-start font-mono text-[10px] font-bold tracking-widest text-ink-soft",
        className
      )}
      {...props}
    />
  )
}

function AdminTD({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={cn("px-4 py-3 align-middle font-medium text-ink", className)}
      {...props}
    />
  )
}

/** بادج موحّد لحالات/أنواع الداشبورد */
export function Tag({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 gap-0 rounded-sm font-mono text-[10px] font-bold tracking-wide",
        className
      )}
    >
      {children}
    </Badge>
  )
}

export { AdminTable, AdminTHead, AdminTR, AdminTH, AdminTD }
