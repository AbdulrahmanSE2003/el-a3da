"use client"

import { Minus, Plus } from "lucide-react"
import { useState } from "react"

import { createGame, startRoleReveal } from "@/games/amir-el-zalam"

import type { AmirGameState } from "@/games/amir-el-zalam/types"

import { usePartyStore } from "@/store/party-store"
import { Button } from "@/components/ui/button"
import { GameGuideModal } from "./GameGuide"

interface RoleSetupProps {
  onStart: (game: AmirGameState) => void
}

const RoleSetup = ({ onStart }: RoleSetupProps) => {
  const players = usePartyStore((state) => state.players)

  const maxMafia = Math.floor(players.length / 2)

  const [mafiaCount, setMafiaCount] = useState(maxMafia > 0 ? 1 : 0)

  const civilianCount = players.length - mafiaCount - 2

  const canDecrease = mafiaCount > 1
  const canIncrease = mafiaCount < maxMafia

  const canStart =
    players.length >= 3 && mafiaCount >= 1 && mafiaCount <= maxMafia

  const handleStart = () => {
    if (!canStart) return

    const game = createGame(players, mafiaCount)

    onStart(startRoleReveal(game))
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="border-b border-ink/10 pb-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
            AMIR EL ZALAM
          </p>
          <GameGuideModal />
        </div>

        <h1 className="mt-2 text-4xl font-black text-ink">أمير الظلام</h1>

        <p className="mt-2 text-sm leading-7 text-ink-soft">
          ظبط الأدوار الأول، وبعدها كل واحد يعرف دوره لوحده.
        </p>
      </div>

      <div className="bg-warm-paper rounded-md border border-ink/10 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-ink">عدد اللاعبين</p>

            <p className="mt-1 font-mono text-xs text-ink-soft">
              {players.length} لاعبين
            </p>
          </div>
        </div>
      </div>

      <div className="bg-warm-paper rounded-md border border-ink/10 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-ink">المافيا</p>

            <p className="mt-1 text-xs text-ink-soft">من 1 لحد {maxMafia}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={"outline"}
              onClick={() => setMafiaCount((count) => count - 1)}
              disabled={!canDecrease}
              size={"sm"}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-8 text-center font-mono text-xl font-bold">
              {mafiaCount}
            </span>
            <Button
              variant={"outline"}
              onClick={() => setMafiaCount((count) => count + 1)}
              disabled={!canIncrease}
              size={"sm"}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <RoleCount label="مافيا" count={mafiaCount} />

        <RoleCount label="ظابط" count={1} />

        <RoleCount label="دكتور" count={1} />

        <RoleCount label="صالح" count={Math.max(0, civilianCount)} />
      </div>

      {players.length < 3 && (
        <p className="border-danger/20 bg-danger/5 text-danger border p-3 text-center text-sm">
          محتاجين 3 لاعبين على الأقل.
        </p>
      )}

      <Button onClick={handleStart} disabled={!canStart}>
        ابدأ اللعبة
      </Button>
    </section>
  )
}

interface RoleCountProps {
  label: string
  count: number
}

const RoleCount = ({ label, count }: RoleCountProps) => {
  return (
    <div className="rounded-md border border-ink/10 bg-paper p-3 text-center">
      <p className="font-mono text-lg font-bold text-ink">{count}</p>

      <p className="mt-1 text-xs text-ink-soft">{label}</p>
    </div>
  )
}

export default RoleSetup
