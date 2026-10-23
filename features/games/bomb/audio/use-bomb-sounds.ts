"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  createBombAudioPlayer,
  type BombAudioPlayer,
} from "./bomb-audio-player"
import {
  createBombSoundEventTracker,
  type BombSoundEventTracker,
} from "./bomb-sound-events"

export function useBombSounds() {
  const [muted, setMuted] = useState(false)
  const playerRef = useRef<BombAudioPlayer | null>(null)
  const trackerRef = useRef<BombSoundEventTracker | null>(null)
  const mutedRef = useRef(false)

  const getTracker = useCallback(() => {
    if (!trackerRef.current) {
      trackerRef.current = createBombSoundEventTracker()
    }

    return trackerRef.current
  }, [])

  const getPlayer = useCallback(() => {
    if (!playerRef.current) {
      playerRef.current = createBombAudioPlayer()
      playerRef.current.setMuted(mutedRef.current)
    }

    return playerRef.current
  }, [])

  useEffect(() => {
    mutedRef.current = muted
    playerRef.current?.setMuted(muted)
  }, [muted])

  useEffect(() => {
    return () => {
      trackerRef.current?.reset()
      playerRef.current?.stopAll()
      playerRef.current = null
    }
  }, [])

  const toggleMuted = useCallback(() => {
    setMuted((current) => !current)
  }, [])

  const startRound = useCallback(() => {
    const event = getTracker().start()
    if (!event || mutedRef.current) return

    const player = getPlayer()
    player.prime()
    player.play(event)
  }, [getPlayer, getTracker])

  const handleTimer = useCallback(
    (secondsRemaining: number) => {
      const events = getTracker().timer(secondsRemaining)
      if (events.length === 0 || mutedRef.current) return

      const player = getPlayer()
      for (const event of events) {
        player.play(event)
      }

      if (events.includes("explosion")) {
        player.stopTick()
      }
    },
    [getPlayer, getTracker]
  )

  const reset = useCallback(() => {
    getTracker().reset()
    playerRef.current?.stopAll()
  }, [getTracker])

  const stopTimerSounds = useCallback(() => {
    playerRef.current?.stopTick()
  }, [])

  return {
    muted,
    toggleMuted,
    startRound,
    handleTimer,
    reset,
    stopTimerSounds,
  }
}
