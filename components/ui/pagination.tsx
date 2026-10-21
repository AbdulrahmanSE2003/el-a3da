import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "cn"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="pagination"
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="pagination-item" className={cn("", className)} {...props} />
  )
}

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: React.ComponentProps<"a"> & {
  isActive?: boolean
  size?: "default" | "icon"
}) {
  return (
    <a
      data-slot="pagination-link"
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-1 border text-xs font-bold whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-copper/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "border-ink bg-paper text-ink hover:bg-paper-warm",
        "data-[active=true]:bg-ink data-[active=true]:text-paper data-[active=true]:shadow-[4px_4px_0px_0px_var(--color-copper)] data-[active=true]:hover:bg-ink",
        "aria-disabled:pointer-events-none aria-disabled:opacity-50",
        "size-8 rounded-sm border font-mono",
        size === "default" && "h-8 px-2.5",
        size === "icon" && "size-8",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      size="default"
      aria-label="الصفحة السابقة"
      className={cn("gap-1 border-2 px-2.5", className)}
      {...props}
    >
      <ChevronRightIcon className="size-4" />
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      size="default"
      aria-label="الصفحة التالية"
      className={cn("gap-1 border-2 px-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center text-ink-soft",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
