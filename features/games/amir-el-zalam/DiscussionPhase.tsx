"use client"

import { MessageCircle } from "lucide-react"

import { startElimination } from "@/games/amir-el-zalam"
import type { AmirGameState } from "@/games/amir-el-zalam/types"
import { Button } from "@/components/ui/button"

interface DiscussionPhaseProps {
  game: AmirGameState
  onChange: (game: AmirGameState) => void
}

const DiscussionPhase = ({ game, onChange }: DiscussionPhaseProps) => {
  const alivePlayers = game.players.filter((player) => player.alive)

  const silencedPlayers = alivePlayers.filter((player) => player.silenced)

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="border-b border-ink/20 pb-5">
        <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
          DAY {game.night}
        </p>

        <h1 className="mt-2 text-4xl font-black text-ink">المناقشة</h1>

        <p className="mt-3 text-sm leading-7 text-ink-soft">
          اتكلموا.
          <br />
          شكّوا في بعض.
          <br />
          وبعدين قرروا مين يخرج.
        </p>
      </div>

      <div className="bg-warm-paper rounded-md border border-ink/20 p-5">
        <div className="flex items-center gap-3">
          <MessageCircle className="size-5 text-copper" />

          <div>
            <p className="font-bold text-ink">اللاعبين الأحياء</p>

            <p className="mt-1 text-xs text-ink-soft">
              {alivePlayers.length} لاعبين
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 rounded-md">
          {alivePlayers.map((player) => (
            <span
              key={player.id}
              className={`rounded-md border px-3 py-1 text-sm font-bold ${
                player.silenced
                  ? "border-danger-brand/20 bg-danger-brand/5 text-danger-brand"
                  : "border-ink/20 bg-paper text-ink"
              }`}
            >
              {player.name}
            </span>
          ))}
        </div>
      </div>

      {silencedPlayers.length > 0 && (
        <p className="rounded-md border border-danger-brand/20 bg-danger-brand/5 p-3 text-center text-sm font-bold text-danger-brand">
          {silencedPlayers.map((player) => player.name).join("، ")} مش هيشارك في
          الكلام.
        </p>
      )}

      <Button onClick={() => onChange(startElimination(game))}>
        نبدأ التصويت
      </Button>
    </section>
  )
}

export default DiscussionPhase
