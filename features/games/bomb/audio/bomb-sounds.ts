export type BombSoundEvent = "round-start" | "timer-tick" | "explosion"

export type BombSoundDefinition = {
  readonly src: string
  readonly volume: number
}

/**
 * Original synthesized WAV assets served from `public/`.
 * No external audio licensing is involved.
 *
 * The tick and explosion use the same configured playback level so the
 * countdown remains present without being drowned out by the final blast.
 */
export const BOMB_SOUNDS = {
  "round-start": {
    src: "/sounds/bomb/bomb-start.wav",
    volume: 0.45,
  },
  "timer-tick": {
    src: "/sounds/bomb/bomb-tick.wav",
    volume: 0.7,
  },
  explosion: {
    src: "/sounds/bomb/bomb-explosion.wav",
    volume: 0.7,
  },
} as const satisfies Record<BombSoundEvent, BombSoundDefinition>

export const BOMB_SOUND_EVENTS = Object.keys(
  BOMB_SOUNDS
) as BombSoundEvent[]
