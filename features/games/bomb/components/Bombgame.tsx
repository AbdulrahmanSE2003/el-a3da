"use client"

import { BombCategoryKey, BombGameState } from "@/games/bomb/types"
import { useCallback, useState, type ReactNode } from "react"
import { Volume2, VolumeX } from "lucide-react"
import ChooseCategory from "./ChooseCategory"
import NotFound from "@/app/not-found"
import { setCategory } from "@/games/bomb/game"
import BombPlay from "./BombPlay"
import Explosion from "./Explosion"
import { useBombSounds } from "../audio/use-bomb-sounds"

const BombGame = () => {
  const [gameState, setGameState] = useState<BombGameState | null>(null)
  const {
    muted,
    toggleMuted,
    startRound,
    handleTimer,
    reset,
    stopTimerSounds,
  } = useBombSounds()

  const handleSetCategory = useCallback(
    (category: BombCategoryKey) => {
      const newState = setCategory(category)
      if (!newState) return

      startRound()
      setGameState(newState)
    },
    [startRound]
  )

  const handleGameFinished = useCallback(() => {
    setGameState((current) =>
      current?.phase === "playing"
        ? { ...current, phase: "explosion" }
        : current
    )
  }, [])

  const handleRestart = useCallback(() => {
    reset()
    setGameState((current) =>
      current ? { ...current, phase: "setup" } : current
    )
  }, [reset])

  let content: ReactNode

  if (!gameState || gameState.phase === "setup") {
    content = <ChooseCategory onSelectCategory={handleSetCategory} />
  } else if (gameState.phase === "playing") {
    content = (
      <BombPlay
        game={gameState}
        onFinish={handleGameFinished}
        onTimer={handleTimer}
        onTimerStop={stopTimerSounds}
      />
    )
  } else if (gameState.phase === "explosion") {
    content = <Explosion onRestart={handleRestart} />
  } else {
    content = <NotFound />
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex justify-start">
        <button
          type="button"
          onClick={toggleMuted}
          aria-pressed={muted}
          aria-label={muted ? "تشغيل صوت القنبلة" : "كتم صوت القنبلة"}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper px-3 py-1.5 text-[10px] font-bold text-ink-soft shadow-[2px_2px_0_var(--color-ink)] transition-colors hover:border-copper/50 hover:text-ink"
        >
          {muted ? (
            <VolumeX className="size-3.5" />
          ) : (
            <Volume2 className="size-3.5" />
          )}
          {muted ? "الصوت مقفول" : "الصوت شغال"}
        </button>
      </div>

      {content}
    </div>
  )
}

export default BombGame
