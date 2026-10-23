import type { BombSoundEvent } from "./bomb-sounds"

export type BombSoundEventTracker = {
  start: () => BombSoundEvent | null
  timer: (secondsRemaining: number) => BombSoundEvent[]
  reset: () => void
}

/**
 * Pure event detector for one Bomb round.
 *
 * It is deliberately separate from playback: repeated React renders can call
 * `timer()` with the same value without producing repeated sound events.
 */
export function createBombSoundEventTracker(): BombSoundEventTracker {
  let started = false
  let finished = false
  let lastSeconds: number | null = null

  return {
    start() {
      if (started || finished) return null

      started = true
      return "round-start"
    },

    timer(secondsRemaining) {
      if (!started || finished) return []

      const seconds = Math.max(0, Math.floor(secondsRemaining))

      if (seconds === 0) {
        finished = true
        lastSeconds = 0
        return ["explosion"]
      }

      const previousSeconds = lastSeconds
      lastSeconds = seconds

      if (previousSeconds === null || seconds === previousSeconds) return []
      if (seconds < previousSeconds) return ["timer-tick"]

      return []
    },

    reset() {
      started = false
      finished = false
      lastSeconds = null
    },
  }
}
