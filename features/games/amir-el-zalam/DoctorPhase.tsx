"use client"

import { HeartPulse } from "lucide-react"
import { useState } from "react"

import { healPlayer, resolveNight } from "@/games/amir-el-zalam"
import type { AmirGameState } from "@/games/amir-el-zalam/types"
import { Button } from "@/components/ui/button"

interface DoctorPhaseProps {
  game: AmirGameState
  onChange: (game: AmirGameState) => void
}

const DoctorPhase = ({ game, onChange }: DoctorPhaseProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    game.nightActions.doctorTargetId
  )

  const doctor = game.players.find((player) => player.role === "doctor")

  const targets = game.players.filter((player) => player.alive)

  const handleContinue = () => {
    if (!selectedId) return

    const nextGame = healPlayer(game, selectedId)

    onChange(resolveNight(nextGame))
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="border-b border-ink/10 pb-5">
        <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
          NIGHT {game.night}
        </p>

        <h1 className="mt-2 text-4xl font-black text-ink">
          الدكتور - {doctor?.name}
        </h1>

        <p className="mt-3 text-sm leading-7 text-ink-soft">
          اختار لاعب واحد تنقذه الليلة.
          <br />
          تقدر تنقذ نفسك.
        </p>
      </div>

      <div className="bg-warm-paper rounded-md border border-ink/10 p-5">
        <div className="flex items-center gap-3">
          <HeartPulse className="size-5 text-copper" />

          <div>
            <p className="font-bold text-ink">مين هيتعالج؟</p>

            <p className="mt-1 text-xs text-ink-soft">اختيار واحد فقط.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {targets.map((player) => {
            const selected = selectedId === player.id

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => setSelectedId(player.id)}
                className={`rounded-md border px-4 py-3 text-right text-sm font-bold transition-colors ${
                  selected
                    ? "border-copper bg-copper/10 text-copper"
                    : "border-ink/10 bg-paper text-ink hover:border-copper/40"
                }`}
              >
                {player.name}
              </button>
            )
          })}
        </div>
      </div>

      <Button onClick={handleContinue} disabled={!selectedId}>
        خلّص الليلة
      </Button>
    </section>
  )
}

export default DoctorPhase
