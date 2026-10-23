"use client"

import { useEffect, useState } from "react"
import type { BombGameState } from "@/games/bomb/types"
import { bombCategories } from "@/games/bomb/constants"

const BombPlay = ({
  game,
  onFinish,
  onTimer,
  onTimerStop,
}: {
  game: BombGameState
  onFinish: () => void
  onTimer: (secondsRemaining: number) => void
  onTimerStop: () => void
}) => {
  const category = bombCategories[game.category]
  const [time, setTime] = useState(game.timer)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(game.timer)
  }, [game.timer])

  useEffect(() => {
    onTimer(time)

    if (time <= 0) {
      onFinish()
    }
  }, [onFinish, onTimer, time])

  useEffect(() => {
    if (time <= 0) return

    const interval = setInterval(() => {
      setTime((previousTime) => Math.max(0, previousTime - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [time])

  useEffect(() => {
    return () => onTimerStop()
  }, [onTimerStop])

  return (
    <section className="flex w-full flex-col gap-3">
      {/* Bomb Timer Visual */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-6">
        <div className="relative flex size-24 items-center justify-center rounded-full border-2 border-primary/30 bg-paper shadow-primary">
          <div className="relative">
            <span
              className="animate-pulse text-6xl text-red-500"
              aria-hidden="true"
            >
              💣
            </span>
          </div>
        </div>

        <p className="relative mt-4 text-xs font-bold text-ink">
          القنبلة معاك؟ جاوب بسرعة!
        </p>
      </div>

      {/* Question Card */}
      <div className="flex flex-col gap-5 rounded-2xl border-2 border-ink/15 bg-paper p-6 shadow-[4px_4px_0_var(--color-ink)] sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-ink-soft">سؤال القعدة</span>

          <span className="inline-flex items-center gap-2 rounded-full border border-copper/30 bg-copper/10 px-3 py-1.5 text-xs font-black text-copper">
            <span aria-hidden="true">{category.emoji}</span>
            {category.name}
          </span>
        </div>

        <div className="h-px bg-ink/10" />

        <p className="text-center text-2xl leading-relaxed font-black text-ink sm:text-3xl md:text-4xl">
          {game.question.text}
        </p>

        <p className="text-center text-xs font-semibold text-ink-soft">
          جاوب بسرعة وسلّم الموبايل للي بعدك!
        </p>
      </div>
    </section>
  )
}

export default BombPlay
