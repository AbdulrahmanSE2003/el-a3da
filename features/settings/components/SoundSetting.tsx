"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import {
  isSoundEffectsMuted,
  setSoundEffectsMuted,
  subscribeToSoundEffectsMute,
} from "@/games/lib/audio/sound-mute"

export function SoundSetting() {
  const [sfxMuted, setSfxMuted] = useState(isSoundEffectsMuted())

  // المزامنة مع التغييرات القادمة من أي مكان آخر (مثل مكونات أخرى).
  useEffect(() => {
    const unsubscribe = subscribeToSoundEffectsMute((next) => {
      setSfxMuted(next)
    })
    return unsubscribe
  }, [])

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 rounded-md border-2 border-ink bg-card p-4 shadow-[4px_4px_0_var(--color-ink)]">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">المؤثرات الصوتية</p>
        </div>

        <Switch
          checked={!sfxMuted}
          id="sound-effects-toggle"
          onCheckedChange={(checked) => setSoundEffectsMuted(!checked)}
          aria-label={"المؤثرات الصوتية"}
        />
      </div>
      <p className="mt-1 text-xs font-semibold text-ink-soft">
        أصوات تفاعلية أثناء اللعب، موصى بتفعيلها للاستمتاع بتجربة القعدة كاملة.
      </p>
    </section>
  )
}
