"use client"

import { Skull, UserCheck } from "lucide-react"

import type { AmirGameState } from "@/games/amir-el-zalam/types"

import { Button } from "@/components/ui/button"
import { checkWinner } from "@/games/amir-el-zalam/rules"
import { setWinner, startNextNight } from "@/games/amir-el-zalam/game"

interface EliminationResultProps {
  game: AmirGameState
  onChange: (game: AmirGameState) => void
}

const EliminationResult = ({ game, onChange }: EliminationResultProps) => {
  const player = game.players.find(
    (player) => player.id === game.eliminatedPlayerId
  )

  if (!player) return null

  const winner = checkWinner(game)

  const handleContinue = () => {
    if (winner) {
      onChange(setWinner(game, winner))
      return
    }

    onChange(startNextNight(game))
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="rounded-md border-b border-ink/20 pb-5">
        <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
          VOTE / RESULT
        </p>

        <h1 className="mt-2 text-4xl font-black text-ink">القرار طلع</h1>
      </div>

      <div className="bg-warm-paper rounded-md border border-ink/20 p-8 text-center">
        <Skull className="mx-auto size-10 text-danger-brand" />

        <p className="mt-5 text-2xl font-black text-ink">{player.name}</p>

        <p className="mt-3 text-sm text-ink-soft">خرج من اللعبة.</p>

        <div className="mt-6 border-t border-ink/20 pt-5">
          <UserCheck className="mx-auto size-5 text-copper" />

          <p className="mt-2 font-bold text-ink">
            دوره كان: {getRoleLabel(player.role)}
          </p>
        </div>
      </div>

      <Button onClick={handleContinue}>
        {winner ? "اعرفوا مين كسب" : "كمّلوا اللعبة"}
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

export default EliminationResult
