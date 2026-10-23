import type { BombSoundEvent } from "./bomb-sounds"
import { BOMB_SOUND_EVENTS, BOMB_SOUNDS } from "./bomb-sounds"

export type BombPlayback = Promise<void> | void

/**
 * The small part of HTMLAudioElement this player needs.
 * Keeping it structural makes playback testable without a browser.
 */
export type BombAudioElement = {
  currentTime: number
  volume: number
  preload: string
  play: () => BombPlayback
  pause: () => void
}

export type BombAudioFactory = (src: string) => BombAudioElement

export type BombAudioPlayer = {
  prime: () => void
  play: (event: BombSoundEvent) => void
  stop: (event: BombSoundEvent) => void
  stopTick: () => void
  stopAll: () => void
  setMuted: (muted: boolean) => void
}

const createBrowserAudio = (src: string): BombAudioElement => {
  if (typeof Audio === "undefined") {
    throw new Error("Audio is not available")
  }

  const audio = new Audio(src)
  audio.preload = "auto"
  return audio
}

export function createBombAudioPlayer(
  createAudio: BombAudioFactory = createBrowserAudio
): BombAudioPlayer {
  const elements = new Map<BombSoundEvent, BombAudioElement>()
  const unavailable = new Set<BombSoundEvent>()
  let muted = false

  const getElement = (event: BombSoundEvent) => {
    const existing = elements.get(event)
    if (existing) return existing
    if (unavailable.has(event)) return null

    try {
      const element = createAudio(BOMB_SOUNDS[event].src)
      element.preload = "auto"
      element.volume = BOMB_SOUNDS[event].volume
      elements.set(event, element)
      return element
    } catch {
      unavailable.add(event)
      return null
    }
  }

  const stop = (event: BombSoundEvent) => {
    const element = elements.get(event)
    if (!element) return

    try {
      element.pause()
      element.currentTime = 0
    } catch {
      // Audio cleanup must never interrupt gameplay.
    }
  }

  const stopTick = () => {
    stop("timer-tick")
  }

  const stopAll = () => {
    for (const event of BOMB_SOUND_EVENTS) stop(event)
  }

  return {
    prime() {
      for (const event of BOMB_SOUND_EVENTS) getElement(event)
    },

    play(event) {
      if (muted) return

      const element = getElement(event)
      if (!element) return

      try {
        // One element per event prevents overlapping tick instances.
        element.currentTime = 0
        const playback = element.play()
        if (playback && typeof playback.catch === "function") {
          playback.catch(() => {
            // Autoplay restrictions and missing files are non-fatal.
          })
        }
      } catch {
        // Playback failures must never interrupt gameplay.
      }
    },

    stop,

    stopTick,

    stopAll,

    setMuted(nextMuted) {
      muted = nextMuted
      if (muted) stopAll()
    },
  }
}
