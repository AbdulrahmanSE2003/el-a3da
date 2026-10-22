"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

import { revealNextPlayer } from "@/games/amir-el-zalam"

import type { AmirGameState } from "@/games/amir-el-zalam/types"
import { Button } from "@/components/ui/button"

interface RoleRevealProps {
  game: AmirGameState
  onChange: (game: AmirGameState) => void
}

const RoleReveal = ({ game, onChange }: RoleRevealProps) => {
  const [revealed, setRevealed] = useState(false)

  const player = game.players[game.currentRevealIndex]

  if (!player) {
    return null
  }

  const handleNext = () => {
    setRevealed(false)

    const nextGame = revealNextPlayer(game)

    onChange(nextGame)
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="border-b border-ink/10 pb-5">
        <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
          ROLE REVEAL
        </p>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-sm text-ink-soft">دورك يا</p>

            <h1 className="mt-1 text-4xl font-black text-ink">{player.name}</h1>
          </div>

          <span className="font-mono text-xs text-ink-soft">
            {game.currentRevealIndex + 1}
            {" / "}
            {game.players.length}
          </span>
        </div>
      </div>

      <div className="bg-warm-paper rounded-md border border-ink/15 p-8 text-center">
        {!revealed ? (
          <>
            <Eye className="mx-auto size-10 text-copper" />

            <p className="mt-5 text-lg font-bold text-ink">بص لوحدك</p>

            <p className="mt-2 text-sm leading-7 text-ink-soft">
              متخليش حد يشوف شاشة الموبايل.
            </p>

            <Button className="my-2 w-full" onClick={() => setRevealed(true)}>
              اكشف دوري
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs font-bold text-copper">دورك</p>

            <h2 className="mt-4 text-5xl font-black text-ink">
              {getRoleLabel(player.role)}
            </h2>

            <p className="mt-4 text-sm leading-7 text-ink-soft">
              افتكر دورك كويس ومتقولش لحد.
            </p>
          </>
        )}
      </div>

      {revealed && (
        <Button variant={"secondary"} onClick={handleNext}>
          {game.currentRevealIndex < game.players.length - 1
            ? "  تمام — اللاعب اللي بعدي"
            : "يلا بينا"}
        </Button>
      )}
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

export default RoleReveal
