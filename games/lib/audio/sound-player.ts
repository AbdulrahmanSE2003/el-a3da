/**
 * مشغّل صوت عام يتبع نفس نمط مشغّل القنبلة
 * (`features/games/bomb/audio/bomb-audio-player.ts`).
 *
 * يدير عنصر HTMLAudioElement واحد لكل مصدر صوت، ويمنع التكرار والتداخل،
 * ويحترم حالة الكتم العامة، ولا ينقطع اللعب عند فشل التشغيل.
 */

import { isSoundEffectsMuted, setSoundEffectsMuted } from "./sound-mute"

export type AudioElement = {
  currentTime: number
  volume: number
  preload: string
  loop: boolean
  play: () => Promise<void> | void
  pause: () => void
}

export type AudioFactory = (src: string) => AudioElement

const createBrowserAudio = (src: string): AudioElement => {
  if (typeof Audio === "undefined") {
    throw new Error("Audio is not available")
  }

  const audio = new Audio(src)
  audio.preload = "auto"
  return audio
}

export function createSoundPlayer(createAudio: AudioFactory = createBrowserAudio) {
  const elements = new Map<string, AudioElement>()
  const unavailable = new Set<string>()

  const getElement = (src: string, volume: number, loop: boolean): AudioElement | null => {
    const existing = elements.get(src)
    if (existing) return existing
    if (unavailable.has(src)) return null

    try {
      const element = createAudio(src)
      element.preload = "auto"
      element.volume = volume
      element.loop = loop
      elements.set(src, element)
      return element
    } catch {
      unavailable.add(src)
      return null
    }
  }

  const stop = (src: string) => {
    const element = elements.get(src)
    if (!element) return

    try {
      element.pause()
      element.currentTime = 0
    } catch {
      // تنظيف الصوت يجب ألا يقاطع اللعب.
    }
  }

  const stopAll = () => {
    for (const src of elements.keys()) stop(src)
  }

  return {
    /**
     * تشغيل صوت بمصدر معين. إذا كان الصوت مضغوطًا أو المصدر غير متاح، يُتجاهل.
     * يتم إعادة تعيين currentTime إلى 0 قبل كل تشغيل لمنع التداخل مع تشغيل سابق لنفس المصدر.
     */
    play(src: string, volume = 1, loop = false) {
      if (isSoundEffectsMuted()) return

      const element = getElement(src, volume, loop)
      if (!element) return

      try {
        element.currentTime = 0
        element.loop = loop
        const playback = element.play()
        if (playback && typeof playback.catch === "function") {
          playback.catch(() => {
            // قيود التشغيل التلقائي والملفات المفقودة ليست مميتة.
          })
        }
      } catch {
        // فشل التشغيل لا يجب أن يقاطع اللعب.
      }
    },

    stop,

    stopAll,

    setMuted(nextMuted: boolean) {
      // حالة كتم المؤثرات الصوتية تُدار عبر sound-mute.ts؛ هذه الدالة للتوافق فقط.
      setSoundEffectsMuted(nextMuted)
      if (nextMuted) stopAll()
    },
  }
}
