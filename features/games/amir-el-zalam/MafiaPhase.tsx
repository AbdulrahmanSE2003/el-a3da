"use client"

import { useState } from "react"

import { LucideIcon, Skull, VolumeX } from "lucide-react"

import {
  setMafiaKillTarget,
  setMafiaSilenceTarget,
  startPolicePhase,
} from "@/games/amir-el-zalam"
import type { AmirGameState } from "@/games/amir-el-zalam/types"
import { Button } from "@/components/ui/button"

interface MafiaPhaseProps {
  game: AmirGameState
  onChange: (game: AmirGameState) => void
}

const MafiaPhase = ({ game, onChange }: MafiaPhaseProps) => {
  const [killTargetId, setKillTargetId] = useState<string | null>(
    game.nightActions.mafiaKillTargetId
  )

  const [silenceTargetId, setSilenceTargetId] = useState<string | null>(
    game.nightActions.mafiaSilenceTargetId
  )

  const alivePlayers = game.players.filter((player) => player.alive)

  const mafiaPlayers = alivePlayers.filter((player) => player.role === "mafia")

  const killTargets = alivePlayers.filter((player) => player.role !== "mafia")

  const silenceTargets = alivePlayers

  const handleKillTarget = (playerId: string) => {
    setKillTargetId(playerId)

    onChange(setMafiaKillTarget(game, playerId))
  }

  const handleSilenceTarget = (playerId: string) => {
    setSilenceTargetId(playerId)

    onChange(setMafiaSilenceTarget(game, playerId))
  }

  const canContinue = killTargetId !== null && silenceTargetId !== null

  const handleContinue = () => {
    if (!canContinue) return

    onChange(startPolicePhase(game))
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="border-b border-ink/20 pb-5">
        <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
          NIGHT {game.night}
        </p>

        <h1 className="mt-2 text-4xl font-black text-ink">المافيا</h1>

        <p className="mt-3 text-sm leading-7 text-ink-soft">
          المافيا تصحى.
          <br />
          اختاروا مين يموت ومين يسكت.
        </p>
      </div>

      <div className="bg-warm-paper rounded-md border border-ink/20 p-5">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-bold text-ink">المافيا الموجودة</p>

            <p className="mt-1 text-xs text-ink-soft">
              {mafiaPlayers.length} لاعبين
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 rounded-md">
          {mafiaPlayers.map((player) => (
            <span
              key={player.id}
              className="rounded-md border border-danger-brand/20 bg-danger-brand/5 px-3 py-1 text-sm font-bold text-danger-brand"
            >
              {player.name}
            </span>
          ))}
        </div>
      </div>

      <TargetSection
        title="مين هيموت؟"
        description="اختاروا لاعب واحد للقتل."
        icon={Skull}
        players={killTargets}
        selectedId={killTargetId}
        onSelect={handleKillTarget}
      />

      <TargetSection
        title="مين هيسكت؟"
        description="أي لاعب حي ممكن يتكتم، حتى لو من المافيا."
        icon={VolumeX}
        players={silenceTargets}
        selectedId={silenceTargetId}
        onSelect={handleSilenceTarget}
      />

      <Button disabled={!canContinue} onClick={handleContinue}>
        كمّل
      </Button>
    </section>
  )
}

interface TargetSectionProps {
  title: string
  description: string
  icon: LucideIcon
  players: AmirGameState["players"]
  selectedId: string | null
  onSelect: (playerId: string) => void
}

const TargetSection = ({
  title,
  description,
  icon,
  players,
  selectedId,
  onSelect,
}: TargetSectionProps) => {
  const Icon = icon

  return (
    <div className="bg-warm-paper rounded-md border border-ink/20 p-5">
      <div className="flex items-center gap-3">
        <div className="mt-0.5 text-copper">
          <Icon className="size-7" />
        </div>

        <div>
          <h2 className="font-bold text-ink">{title}</h2>

          <p className="mt-1 text-xs leading-5 text-ink-soft">{description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {players.map((player) => {
          const selected = selectedId === player.id

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => onSelect(player.id)}
              className={`rounded-md border px-4 py-3 text-right text-sm font-bold transition-colors ${
                selected
                  ? "border-copper bg-copper/10 text-copper"
                  : "border-ink/20 bg-paper text-ink hover:border-copper/40"
              }`}
            >
              {player.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MafiaPhase
