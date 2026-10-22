"use client"

import { Skull, Trophy } from "lucide-react"
import Link from "next/link"

import type { AmirGameState } from "@/games/amir-el-zalam/types"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

interface GameFinishedProps {
  game: AmirGameState
}

const GameFinished = ({ game }: GameFinishedProps) => {
  const mafiaWon = game.winner === "mafia"

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="border-b border-ink/20 pb-5">
        <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
          GAME OVER
        </p>

        <h1 className="mt-2 text-4xl font-black text-ink">خلصت اللعبة</h1>

        <p className="mt-3 text-sm leading-7 text-ink-soft">
          القعدة عرفت مين كسب.
        </p>
      </div>

      <div className="bg-warm-paper border border-copper/30 p-8 text-center">
        {mafiaWon ? (
          <Skull className="mx-auto size-10 text-danger-brand" />
        ) : (
          <Trophy className="mx-auto size-10 text-copper" />
        )}

        <p className="mt-5 font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
          WINNER
        </p>

        <h2 className="mt-3 text-4xl font-black text-ink">
          {mafiaWon ? "المافيا" : "الصالحين"}
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        {game.players.map((player) => (
          <div
            key={player.id}
            className="bg-warm-paper flex items-center justify-between border border-ink/20 px-4 py-3"
          >
            <span className="font-bold text-ink">{player.name}</span>

            <span
              className={cn(
                "text-xs font-bold",
                player.role === "mafia" ? "text-ink-glow" : "text-ink"
              )}
            >
              {getRoleLabel(player.role)}
            </span>
          </div>
        ))}
      </div>

      <Button variant={"outline"} asChild>
        <Link href="/games">رجوع للألعاب</Link>
      </Button>
    </section>
  )
}

const getRoleLabel = (role: AmirGameState["players"][number]["role"]) => {
  switch (role) {
    case "mafia":
      return "مافيا"
    case "police":
      return "ظابط"
    case "doctor":
      return "دكتور"
    case "civilian":
      return "صالح"
  }
}

export default GameFinished
