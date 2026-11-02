"use client"

import { Button } from "@/components/ui/button"
import type { CasinoGamePlayer } from "@/games/casino/types"
import { Medal, Minus, Plus, Star } from "lucide-react"

const RANK_STYLES = {
  1: {
    badge:
      "border-amber-500 bg-amber-500 text-white dark:bg-amber-400 dark:text-neutral-950 shadow-sm",
    label: "المركز الأول",
  },
  2: {
    badge:
      "border-slate-400 bg-slate-400 text-white dark:bg-slate-300 dark:text-neutral-950 shadow-sm",
    label: "المركز الثاني",
  },
  3: {
    badge:
      "border-amber-700 bg-amber-700 text-white dark:bg-amber-600 shadow-sm",
    label: "المركز الثالث",
  },
} as const

const PlayersPoints = ({
  players,
  onChange,
}: {
  players: CasinoGamePlayer[]
  onChange: (player: CasinoGamePlayer, action: "increase" | "decrease") => void
}) => {
  const topThree = [...players].sort((a, b) => b.score - a.score).slice(0, 3)

  const getRank = (playerId: string): 1 | 2 | 3 | null => {
    const index = topThree.findIndex((p) => p.id === playerId)
    return index === -1 ? null : ((index + 1) as 1 | 2 | 3)
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="flex items-center gap-2 text-xl font-black text-ink">
        <Star className="size-5 shrink-0 text-copper" strokeWidth={2} />
        النقاط
      </p>

      <div className="grid w-full grid-cols-1 gap-4">
        {players.map((p) => {
          const rank = getRank(p.id)
          return (
            <div
              key={p.id}
              className="flex w-full items-center justify-between gap-3 rounded-sm border-2 border-ink bg-paper p-4 shadow-[3px_3px_0px_0px_var(--color-ink)]"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                {rank ? (
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-md border-2 ${RANK_STYLES[rank].badge}`}
                    title={RANK_STYLES[rank].label}
                    aria-label={RANK_STYLES[rank].label}
                  >
                    <Medal className="size-4" strokeWidth={2.5} />
                  </span>
                ) : (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-dashed border-ink/30 text-xs font-bold text-ink/40">
                    -
                  </span>
                )}

                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-base leading-tight font-black text-ink">
                    {p.name}
                  </span>
                  {rank && (
                    <span className={`text-[11px] font-bold`}>
                      {RANK_STYLES[rank].label}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onChange(p, "decrease")}
                  size="icon"
                  variant="outline"
                  className="size-9"
                  aria-label={`نقص نقاط ${p.name}`}
                >
                  <Minus className="size-4" strokeWidth={2.5} />
                </Button>

                <span className="min-w-8 text-center text-lg font-black text-copper tabular-nums">
                  {p.score}
                </span>

                <Button
                  onClick={() => onChange(p, "increase")}
                  size="icon"
                  variant="outline"
                  className="size-9"
                  aria-label={`زود نقاط ${p.name}`}
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PlayersPoints
