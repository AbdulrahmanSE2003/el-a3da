"use client"

import { ChangeEvent, ReactNode, useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { formatNumber } from "../lib/format"

interface AdminPaginationProps {
  page: number
  pageCount: number
  totalItems: number
  onPageChange: (page: number) => void
}

const goToHref = "#"

/** صفحات مرقّمة مع قفز مباشر لأي صفحة — مبني على مكونات shadcn pagination */
export function AdminPagination({
  page,
  pageCount,
  totalItems,
  onPageChange,
}: AdminPaginationProps) {
  const [jumpTo, setJumpTo] = useState("")

  if (pageCount <= 1) {
    return (
      <p className="pt-3 text-center font-mono text-xs text-ink-soft/70">
        {formatNumber(totalItems)} عنصر
      </p>
    )
  }

  const goTo = (target: number) => {
    const clamped = Math.min(Math.max(1, target), pageCount)
    if (clamped !== page) onPageChange(clamped)
  }

  const handleJump = (event: ChangeEvent) => {
    event.preventDefault()
    const parsed = Number.parseInt(
      jumpTo.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))),
      10
    )
    setJumpTo("")
    if (Number.isFinite(parsed)) goTo(parsed)
  }

  const numberedPages = [
    ...new Set(
      [1, page - 1, page, page + 1, pageCount].filter(
        (value) => value >= 1 && value <= pageCount
      )
    ),
  ].sort((a, b) => a - b)

  const items: ReactNode[] = []
  numberedPages.forEach((target, index) => {
    if (index > 0 && target - numberedPages[index - 1] > 1) {
      items.push(
        <PaginationItem key={`ellipsis-${target}`}>
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    items.push(
      <PaginationItem key={`page-${target}`}>
        <PaginationLink
          href={goToHref}
          isActive={target === page}
          aria-label={`الصفحة ${target}`}
          onClick={(event) => {
            event.preventDefault()
            goTo(target)
          }}
        >
          {target}
        </PaginationLink>
      </PaginationItem>
    )
  })

  return (
    <div className="flex flex-col gap-2 pt-3">
      <Pagination className="justify-between">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={goToHref}
              aria-disabled={page <= 1}
              onClick={(event) => {
                event.preventDefault()
                if (page > 1) goTo(page - 1)
              }}
            />
          </PaginationItem>

          {items}

          <PaginationItem>
            <PaginationNext
              href={goToHref}
              aria-disabled={page >= pageCount}
              onClick={(event) => {
                event.preventDefault()
                if (page < pageCount) goTo(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>

        {/* قفز مباشر لأي صفحة */}
        <form
          onSubmit={handleJump}
          className="hidden items-center gap-2 sm:flex"
        >
          <label
            htmlFor="pagination-jump"
            className="text-[11px] font-bold whitespace-nowrap text-ink-soft"
          >
            صفحة
          </label>
          <input
            id="pagination-jump"
            dir="ltr"
            inputMode="numeric"
            value={jumpTo}
            onChange={(event) =>
              setJumpTo(event.target.value.replace(/\D+/g, ""))
            }
            placeholder={`1-${pageCount}`}
            aria-label="اذهب إلى صفحة"
            className="h-8 w-16 rounded-sm border-2 border-ink bg-paper px-2 text-center font-mono text-xs font-bold text-ink outline-none placeholder:text-ink-soft/50 focus-visible:ring-[3px] focus-visible:ring-copper/50"
          />
          <button
            type="submit"
            className="h-8 rounded-sm border-2 border-ink bg-paper px-2 text-[11px] font-bold text-ink transition-colors hover:bg-paper-warm focus-visible:ring-[3px] focus-visible:ring-copper/50"
          >
            اذهب
          </button>
        </form>
      </Pagination>

      <p className="text-center font-mono text-[10px] text-ink-soft/70">
        صفحة {formatNumber(page)} من {formatNumber(pageCount)} ·{" "}
        {formatNumber(totalItems)} عنصر
      </p>
    </div>
  )
}
