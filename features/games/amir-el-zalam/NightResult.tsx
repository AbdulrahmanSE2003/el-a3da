"use client"

import { Skull, ShieldCheck, VolumeX } from "lucide-react"

import { finishNightAndContinue } from "@/games/amir-el-zalam"
import type { AmirGameState } from "@/games/amir-el-zalam/types"
import { Button } from "@/components/ui/button"

interface NightResultProps {
  game: AmirGameState
  onChange: (game: AmirGameState) => void
}

const NightResult = ({ game, onChange }: NightResultProps) => {
  const killedPlayer = game.players.find(
    (player) => player.id === game.lastNightKilledId
  )
  const savedPlayer = game.players.find(
    (player) => player.id === game.lastNightSavedId
  )

  const policeTarget = game.players.find(
    (player) => player.id === game.lastPoliceTargetId
  )

  const silencedPlayer = game.players.find((player) => player.silenced)

  const handleContinue = () => {
    onChange(finishNightAndContinue(game))
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="border-b border-ink/20 pb-5">
        <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
          NIGHT {game.night} / RESULT
        </p>

        <h1 className="mt-2 text-4xl font-black text-ink">الصبح طلع</h1>

        <p className="mt-3 text-sm leading-7 text-ink-soft">
          شوفوا إيه اللي حصل بالليل.
        </p>
      </div>
      <div className="bg-warm-paper rounded-md border border-ink/20 p-6">
        {killedPlayer && (
          <div className="flex items-start gap-4">
            <Skull className="mt-1 size-5 shrink-0 text-danger-brand" />

            <div>
              <p className="font-bold text-ink">في حد مات الليلة.</p>

              <p className="mt-1 text-2xl font-black text-danger-brand">
                {killedPlayer.name}
              </p>
            </div>
          </div>
        )}

        {savedPlayer && (
          <div className="border-t border-ink/20 pt-5">
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 size-5 shrink-0 text-copper" />

              <div>
                <p className="font-bold text-ink">
                  {savedPlayer.name} اتنقذ الليلة.
                </p>
              </div>
            </div>
          </div>
        )}

        {game.lastPoliceResult && policeTarget && (
          <div className="mt-6 border-t border-ink/20 pt-5">
            <p className="font-bold text-ink">
              {policeTarget.name} اتكشف إنه مافيا وخرج من اللعبة.
            </p>
          </div>
        )}

        {silencedPlayer && (
          <div className="mt-6 border-t border-ink/20 pt-5">
            <div className="flex items-start gap-4">
              <VolumeX className="mt-1 size-5 shrink-0 text-copper" />

              <div>
                <p className="font-bold text-ink">
                  {silencedPlayer.name} ساكت النهارده.
                </p>

                <p className="mt-1 text-sm text-ink-soft">
                  مش هيشارك في المناقشة.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Button onClick={handleContinue}>
        {game.winner ? "المافيا كسبت" : "يلا المناقشة"}
      </Button>{" "}
    </section>
  )
}

export default NightResult
