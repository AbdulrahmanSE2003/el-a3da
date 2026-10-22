"use client"

import { Gavel } from "lucide-react"
import { useState } from "react"

import { eliminate } from "@/games/amir-el-zalam"
import type { AmirGameState } from "@/games/amir-el-zalam/types"
import { Button } from "@/components/ui/button"

interface EliminationPhaseProps {
  game: AmirGameState
  onChange: (game: AmirGameState) => void
}

const EliminationPhase = ({ game, onChange }: EliminationPhaseProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const players = game.players.filter((player) => player.alive)

  const handleEliminate = () => {
    if (!selectedId) return

    onChange(eliminate(game, selectedId))
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="border-b border-ink/20 pb-5">
        <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
          VOTE
        </p>

        <h1 className="mt-2 text-4xl font-black text-ink">مين يخرج؟</h1>

        <p className="mt-3 text-sm leading-7 text-ink-soft">
          اختاروا لاعب واحد.
          <br />
          القرار نهائي.
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-md">
        {players.map((player) => {
          const selected = selectedId === player.id

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => setSelectedId(player.id)}
              className={`flex items-center gap-3 rounded-md border p-4 text-right transition-colors ${
                selected
                  ? "border-danger-brand bg-danger-brand/5"
                  : "bg-warm-paper border-ink/20 hover:border-copper/40"
              }`}
            >
              <Gavel
                className={`size-4 ${
                  selected ? "text-danger-brand" : "text-ink-soft"
                }`}
              />

              <span className="font-bold text-ink">{player.name}</span>
            </button>
          )
        })}
      </div>

      <Button onClick={handleEliminate} disabled={!selectedId}>
        يخرج من اللعبة
      </Button>
    </section>
  )
}

export default EliminationPhase
