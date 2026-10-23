#!/usr/bin/env tsx
/**
 * test-bomb-sounds — pure tests for the Bomb sound event mapping,
 * duplicate suppression, mute behavior, playback failure handling, and the
 * Bomb content-set wiring (bundled fallback + injected snapshot selection).
 *
 * The project has no test runner, so this follows the existing `tsx` script
 * convention. No browser, speakers, network, or real audio playback is needed.
 *
 * Usage:
 *   pnpm test:bomb
 */

import { existsSync } from "node:fs"
import path from "node:path"
import {
  BOMB_SOUNDS,
  BOMB_SOUND_EVENTS,
  type BombSoundEvent,
} from "@/features/games/bomb/audio/bomb-sounds"
import { createBombSoundEventTracker } from "@/features/games/bomb/audio/bomb-sound-events"
import {
  createBombAudioPlayer,
  type BombAudioElement,
} from "@/features/games/bomb/audio/bomb-audio-player"
import { bombQuestions } from "@/contents/bomb"
import { setCategory } from "@/games/bomb/game"
import { bombCategoryKeys, isBombCategory } from "@/games/bomb/constants"
import { toBombQuestions } from "@/games/bomb/utils"
import { getBundledSnapshot } from "@/lib/content/provider"
import type { ContentQuestion } from "@/lib/content/types"

let passed = 0
let failed = 0

function check(label: string, ok: boolean, detail = "") {
  passed += ok ? 1 : 0
  failed += ok ? 0 : 1
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`)
}

function equal<T>(label: string, actual: T, expected: T) {
  const actualJson = JSON.stringify(actual)
  const expectedJson = JSON.stringify(expected)
  check(
    label,
    actualJson === expectedJson,
    actualJson === expectedJson
      ? ""
      : `expected ${expectedJson}, got ${actualJson}`
  )
}

function makeTracker() {
  return createBombSoundEventTracker()
}

class FakeAudio implements BombAudioElement {
  currentTime = 0
  volume = 1
  preload = ""
  playCalls = 0
  pauseCalls = 0

  constructor(private readonly rejectPlay = false) {}

  play(): Promise<void> {
    this.playCalls++
    return this.rejectPlay
      ? Promise.reject(new Error("playback blocked"))
      : Promise.resolve()
  }

  pause() {
    this.pauseCalls++
  }
}

function makePlayer({
  rejectPlay = false,
  failFactory = false,
}: {
  rejectPlay?: boolean
  failFactory?: boolean
} = {}) {
  const elements = new Map<string, FakeAudio>()
  const player = createBombAudioPlayer((src) => {
    if (failFactory) throw new Error("missing asset")

    const element = new FakeAudio(rejectPlay)
    elements.set(src, element)
    return element
  })

  return { player, elements }
}

function elementFor(
  elements: Map<string, FakeAudio>,
  event: BombSoundEvent
): FakeAudio {
  const element = elements.get(BOMB_SOUNDS[event].src)
  if (!element) throw new Error(`Missing fake audio for ${event}`)
  return element
}

function publicAssetExists(src: string) {
  return existsSync(path.join(process.cwd(), "public", src.replace(/^\//, "")))
}

async function main() {
  console.log("\n1) Sound definitions and event mapping")
  equal("all three Bomb events are mapped", [...BOMB_SOUND_EVENTS].sort(), [
    "explosion",
    "round-start",
    "timer-tick",
  ])

  for (const event of BOMB_SOUND_EVENTS) {
    const sound = BOMB_SOUNDS[event]
    check(`${event}: public WAV path`, sound.src.endsWith(".wav"))
    check(
      `${event}: volume is sane`,
      sound.volume > 0 && sound.volume <= 1,
      String(sound.volume)
    )
    check(`${event}: asset exists`, publicAssetExists(sound.src))
  }

  check(
    "tick is raised above the start cue",
    BOMB_SOUNDS["timer-tick"].volume > BOMB_SOUNDS["round-start"].volume
  )
  check(
    "tick is at least as loud as the explosion",
    BOMB_SOUNDS["timer-tick"].volume >= BOMB_SOUNDS.explosion.volume
  )
  check(
    "warning asset was removed",
    !publicAssetExists("/sounds/bomb/bomb-warning.wav")
  )

  console.log("\n2) Event tracker: start and duplicate suppression")
  {
    const tracker = makeTracker()
    equal("timer before start emits nothing", tracker.timer(20), [])
    equal(
      "start emits once",
      [tracker.start(), tracker.start()],
      ["round-start", null]
    )
    equal("initial timer establishes baseline", tracker.timer(20), [])
    equal("same timer value emits nothing", tracker.timer(20), [])
    equal("decrement emits one tick", tracker.timer(19), ["timer-tick"])
    equal("duplicate decrement emits nothing", tracker.timer(19), [])
  }

  console.log("\n3) Event tracker: ticking follows the countdown")
  {
    const tracker = makeTracker()
    tracker.start()
    tracker.timer(20)
    equal("each decrement emits one tick", tracker.timer(19), ["timer-tick"])
    equal("next decrement emits one tick", tracker.timer(18), ["timer-tick"])
    equal("increasing value emits no tick", tracker.timer(19), [])
  }

  console.log("\n4) Event tracker: explosion once")
  {
    const tracker = makeTracker()
    tracker.start()
    tracker.timer(1)
    equal("zero emits explosion", tracker.timer(0), ["explosion"])
    equal("zero does not repeat explosion", tracker.timer(0), [])
    equal("no events after finish", tracker.timer(5), [])
  }

  console.log("\n5) Event tracker: reset starts a clean round")
  {
    const tracker = makeTracker()
    tracker.start()
    tracker.timer(20)
    tracker.timer(10)
    tracker.reset()

    equal("restart start emits once", tracker.start(), "round-start")
    tracker.timer(20)
    equal("restart ticking works again", tracker.timer(19), ["timer-tick"])
  }

  console.log("\n6) Player: no side effects at construction")
  {
    const { player, elements } = makePlayer()
    equal("construction creates no audio elements", elements.size, 0)
    player.prime()
    equal("prime creates the three assets", elements.size, 3)
  }

  console.log("\n7) Player: one element per event, no overlapping ticks")
  {
    const { player, elements } = makePlayer()
    player.prime()
    const tick = elementFor(elements, "timer-tick")
    tick.currentTime = 0.4
    player.play("timer-tick")

    equal("tick plays once", tick.playCalls, 1)
    equal("tick restarts from zero", tick.currentTime, 0)
    player.play("timer-tick")
    equal("second tick reuses the same element", elements.size, 3)
    equal("second tick replays the same element", tick.playCalls, 2)
  }

  console.log("\n8) Player: mute behavior")
  {
    const { player, elements } = makePlayer()
    player.prime()
    player.setMuted(true)
    player.play("timer-tick")
    equal(
      "muted play is ignored",
      elementFor(elements, "timer-tick").playCalls,
      0
    )

    player.setMuted(false)
    player.play("timer-tick")
    equal(
      "unmuted play resumes",
      elementFor(elements, "timer-tick").playCalls,
      1
    )
  }

  console.log("\n9) Player: stop behavior")
  {
    const { player, elements } = makePlayer()
    player.prime()
    player.play("timer-tick")
    player.play("explosion")
    player.stopTick()
    equal(
      "stopTick pauses the tick",
      elementFor(elements, "timer-tick").pauseCalls > 0,
      true
    )
    equal(
      "stopTick leaves the explosion alone",
      elementFor(elements, "explosion").pauseCalls,
      0
    )

    player.stopAll()
    equal(
      "stopAll pauses the explosion too",
      elementFor(elements, "explosion").pauseCalls > 0,
      true
    )
  }

  console.log("\n10) Player: rejected playback and missing assets are safe")
  {
    const { player } = makePlayer({ rejectPlay: true })
    player.prime()
    player.play("explosion")
    await Promise.resolve()
    check("rejected play promise is handled", true)

    const { player: missingPlayer } = makePlayer({ failFactory: true })
    missingPlayer.play("round-start")
    check("missing asset does not throw", true)
  }

  console.log("\n11) Bomb content set and snapshot selection")
  {
    const bundled = getBundledSnapshot("bomb")
    equal(
      "bundled Bomb snapshot uses all local questions",
      bundled.questions.length,
      bombQuestions.length
    )
    check("bundled Bomb snapshot is non-empty", bundled.questions.length > 0)
    check(
      "bundled Bomb IDs are unique",
      new Set(bundled.questions.map((question) => question.id)).size ===
        bundled.questions.length
    )
    check(
      "all bundled Bomb categories are playable",
      bundled.questions.every(
        (question) => question.category && isBombCategory(question.category)
      )
    )

    const reversed = [...bundled.questions].reverse()
    const sport = setCategory("SPORT", reversed)
    check(
      "SPORT selection uses the injected snapshot",
      sport?.category === "SPORT"
    )
    check(
      "SPORT selection returns a question from the injected snapshot",
      Boolean(
        sport && reversed.some((question) => question.id === sport.question.id)
      )
    )

    const random = setCategory("RANDOM", bundled.questions)
    check(
      "RANDOM selection lands in a known category with questions",
      Boolean(
        random &&
        bombCategoryKeys.includes(random.category) &&
        bundled.questions.some(
          (question) => question.category === random.category
        )
      )
    )

    equal("empty injected snapshot is safe", setCategory("SPORT", []), null)

    const invalid: ContentQuestion[] = [
      { id: "invalid-1", text: "غير صالح", category: "NOT_A_CATEGORY" },
    ]
    equal("unknown categories are filtered", toBombQuestions(invalid).length, 0)
  }

  console.log(
    failed === 0
      ? `\nALL ${passed} CHECKS PASSED\n`
      : `\n${failed} CHECK(S) FAILED (${passed} passed)\n`
  )
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error("test-bomb-sounds failed:", error)
  process.exit(1)
})
