"use client"

import { useCallback, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { formatNumber } from "../lib/format"
import type { ContentSetId, ContentSetRow } from "../lib/types"
import { buildQueryUrl } from "./lib/build-query-url"

interface QuestionsTabsProps {
  sets: ContentSetRow[]
  setId: ContentSetId
}

export default function QuestionsTabs({ sets, setId }: QuestionsTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const navigate = useCallback(
    (updates: Record<string, string | null>) => {
      const href = buildQueryUrl(
        pathname,
        new URLSearchParams(searchParams.toString()),
        updates
      )

      startTransition(() => {
        router.push(href, { scroll: false })
      })
    },
    [pathname, router, searchParams]
  )

  return (
    <div
      role="tablist"
      aria-label="مجموعات المحتوى"
      className={cn(
        "flex w-full flex-wrap gap-1.5 border-b-2 border-ink pb-5 transition-opacity duration-150",
        isPending && "pointer-events-none opacity-60"
      )}
    >
      {sets.map((set) => {
        const active = set.id === setId

        return (
          <button
            key={set.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={isPending}
            onClick={() =>
              navigate({
                set: set.id,
                category: null,
                page: null,
              })
            }
            className={cn(
              "flex shrink-0 items-center gap-2 border-2 px-3 py-1.5 text-xs font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-copper",
              active
                ? "border-ink bg-ink text-paper shadow-[2px_2px_0_var(--color-ink)]"
                : "border-ink/20 bg-paper-warm/40 text-ink-soft hover:border-ink/50 hover:bg-paper-warm hover:text-ink"
            )}
          >
            <span>{set.title}</span>
            <span
              className={cn(
                "rounded-xs px-1 py-0.5 font-mono text-[10px] font-bold",
                active ? "bg-paper/15 text-paper" : "bg-ink/5 text-ink-soft/80"
              )}
            >
              {formatNumber(set.liveCount)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
