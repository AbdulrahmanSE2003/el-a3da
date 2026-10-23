"use client"

import { Button } from "@/components/ui/button"
import type { CasinoGame } from "@/games/casino/types"
import { Trophy, RotateCcw } from "lucide-react"

const CasinoResult = ({
  game,
  onRestart,
}: {
  game: CasinoGame
  onRestart: () => void
}) => {
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score)

  const winner = game.winner

  return (
    <section dir="rtl" className="flex h-full w-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 border-b border-ink/20 pb-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full border-2 border-copper">
          <Trophy className="size-8 text-copper" />
        </div>

        <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
          CASINO
        </p>

        <h1 className="text-4xl font-black text-ink">خلصت القعدة!</h1>

        <p className="text-sm text-ink-soft">والملك اتحدد 👑</p>
      </div>

      {/* Winner */}
      {winner && (
        <div className="flex flex-col items-center gap-2 rounded-md border-2 border-copper bg-copper/5 p-6 text-center">
          <p className="text-sm font-semibold text-ink-soft">الفائز</p>

          <h2 className="text-3xl font-black text-ink">{winner.name}</h2>

          <p className="text-lg font-bold text-copper">{winner.score} نقطة</p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-ink">النتيجة النهائية</h2>

        <div className="flex flex-col gap-2">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between rounded-md border p-4 ${
                player.id === winner?.id
                  ? "border-copper bg-copper/5"
                  : "border-ink/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-ink/5 text-sm font-bold">
                  {index + 1}
                </span>

                <span className="font-semibold">{player.name}</span>
              </div>

              <span className="font-bold text-copper">{player.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="mt-auto">
        <Button onClick={onRestart} className="w-full" variant="secondary">
          <RotateCcw />
          قعدة جديدة
        </Button>
      </div>
    </section>
  )
}

export default CasinoResult
