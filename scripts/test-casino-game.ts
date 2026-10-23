#!/usr/bin/env tsx
/**
 * test-casino-game — tests for the Casino game engine.
 *
 * The project has no test runner, so this follows the repo's scripting
 * convention and runs with `tsx`. The engine takes an injected deck, so it
 * is exercised without React, IndexedDB, the network, or the database.
 *
 * Usage:
 *   node --import tsx scripts/test-casino-game.ts
 */

import {
  changePlayerScore,
  createGame,
  nextQuestion,
  restartGame,
} from "@/games/casino"
import {
  createContentDeck,
  type ContentDeck,
} from "@/lib/create-content-deck"
import type { ContentQuestion } from "@/lib/content/types"
import type { Player } from "@/store/party-store"

let failures = 0
let passes = 0

function check(label: string, ok: boolean, detail = "") {
  if (ok) {
    passes++
    console.log(`  ✓ ${label}`)
  } else {
    failures++
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`)
  }
}

const players: Player[] = [
  { id: "p1", name: "أحمد" },
  { id: "p2", name: "منى" },
]

const question = (id: string): ContentQuestion => ({
  id,
  text: `سؤال ${id}`,
  correct_answer: `إجابة ${id}`,
})

/**
 * Deck بيدّي الأسئلة بالترتيب بدل الشفل العشوائي — عشان الاختبار يتحكم
 * في اللي بيتسحب ويتأكد إنه نفس الـ deck اللي بيتنقل بين العمليات.
 */
function makeDeck(ids: string[]): ContentDeck<ContentQuestion> {
  let items = ids.map(question)
  let index = 0

  return {
    next: () => items[index++ % items.length],
    reset: (nextItems) => {
      if (nextItems) items = [...nextItems]
      index = 0
    },
    remaining: () => Math.max(0, items.length - index),
  }
}

function main() {
  console.log("\n1) Session uses the injected deck, not bundled questions")
  const firstDeck = makeDeck(["synced-1", "synced-2"])
  const firstGame = createGame(players, 10, firstDeck)

  check(
    "first question comes from the injected deck",
    firstGame.currentQuestion?.id === "synced-1",
    firstGame.currentQuestion?.id
  )
  check(
    "roster is mapped in order",
    firstGame.players.map((p) => p.id).join(",") === "p1,p2",
    firstGame.players.map((p) => p.id).join(",")
  )
  check(
    "scores start at zero",
    firstGame.players.every((p) => p.score === 0)
  )
  check("winning score is stored", firstGame.winningScore === 10)

  const otherDeck = makeDeck(["other-1"])
  const otherGame = createGame(players, 5, otherDeck)

  check(
    "independent sessions can use different sources",
    firstGame.currentQuestion?.id === "synced-1" &&
      otherGame.currentQuestion?.id === "other-1",
    `${firstGame.currentQuestion?.id}/${otherGame.currentQuestion?.id}`
  )

  console.log("\n2) Winning score is normalized at session start")
  check(
    "fractional target floors",
    createGame(players, 12.7, makeDeck(["q"])).winningScore === 12
  )
  check(
    "zero target clamps to 1",
    createGame(players, 0, makeDeck(["q"])).winningScore === 1
  )
  check(
    "negative target clamps to 1",
    createGame(players, -4, makeDeck(["q"])).winningScore === 1
  )
  check(
    "NaN falls back to 10",
    createGame(players, Number.NaN, makeDeck(["q"])).winningScore === 10
  )
  check(
    "Infinity falls back to 10",
    createGame(players, Number.POSITIVE_INFINITY, makeDeck(["q"])).winningScore ===
      10
  )

  console.log("\n3) Scoring, winner detection, and finished phase")
  let game = createGame(players, 2, makeDeck(["a", "b"]))

  game = changePlayerScore(game.players[0], "increase", game)!
  check("increase adds one point", game.players[0].score === 1)
  check(
    "game continues below target",
    game.phase === "game" && game.winner === null
  )

  game = changePlayerScore(game.players[0], "increase", game)!
  check("reaching target finishes the game", game.phase === "finished")
  check("winner is the player who reached target", game.winner?.id === "p1")

  const decreased = changePlayerScore(game.players[0], "decrease", game)!
  check(
    "decrease reopens a finished game",
    decreased.phase === "game" && decreased.winner === null
  )
  check(
    "unknown player is rejected",
    changePlayerScore(
      { id: "nope", name: "مش موجود", score: 0 },
      "increase",
      game
    ) === null
  )

  console.log("\n4) Next question reuses the session deck and keeps state")
  const sessionDeck = makeDeck(["n1", "n2", "n3"])
  let sessionGame = createGame(players, 3, sessionDeck)

  sessionGame = changePlayerScore(
    sessionGame.players[1],
    "increase",
    sessionGame
  )!

  const advanced = nextQuestion(sessionGame, sessionDeck)
  check(
    "next question advances the same deck",
    advanced.currentQuestion?.id === "n2",
    advanced.currentQuestion?.id
  )
  check("scores survive next question", advanced.players[1].score === 1)
  check("target survives next question", advanced.winningScore === 3)

  console.log("\n5) Restart preserves target and roster and continues the deck")
  const restartDeck = makeDeck(["r1", "r2", "r3"])
  let finishedGame = createGame(players, 2, restartDeck)

  finishedGame = changePlayerScore(
    finishedGame.players[1],
    "increase",
    finishedGame
  )!
  finishedGame = changePlayerScore(
    finishedGame.players[1],
    "increase",
    finishedGame
  )!
  check("game reaches finished before restart", finishedGame.phase === "finished")

  const restarted = restartGame(finishedGame, restartDeck)
  check("configured target is preserved", restarted.winningScore === 2)
  check(
    "roster and order are preserved",
    restarted.players.map((p) => p.id).join(",") === "p1,p2",
    restarted.players.map((p) => p.id).join(",")
  )
  check(
    "scores are reset",
    restarted.players.every((p) => p.score === 0)
  )
  check(
    "winner is cleared and phase resets",
    restarted.winner === null && restarted.phase === "game"
  )
  check(
    "restart continues the same deck",
    restarted.currentQuestion?.id === "r2",
    restarted.currentQuestion?.id
  )

  const highTarget = createGame(players, 15, makeDeck(["h1"]))
  check(
    "non-default target survives restart",
    restartGame(highTarget, makeDeck(["h2"])).winningScore === 15
  )

  console.log("\n6) Deck exhaustion refills without repeating until empty")
  const realDeck = createContentDeck([question("d1"), question("d2")])
  const firstId = realDeck.next().id
  const secondId = realDeck.next().id

  check(
    "first two draws are distinct",
    firstId !== secondId,
    `${firstId},${secondId}`
  )
  check(
    "both items are drawn before refill",
    new Set([firstId, secondId]).size === 2
  )
  check("remaining is zero after exhaustion", realDeck.remaining() === 0)

  const thirdId = realDeck.next().id
  check(
    "refill returns an item from the same source",
    thirdId === firstId || thirdId === secondId,
    thirdId
  )
  check("remaining resets after refill", realDeck.remaining() === 1)

  console.log("\n7) Deck reset swaps the content source")
  const resetDeck = createContentDeck([question("old-1")])
  check("old source is served", resetDeck.next().id === "old-1")

  resetDeck.reset([question("new-1"), question("new-2")])
  const resetIds = [resetDeck.next().id, resetDeck.next().id].sort()

  check(
    "reset uses the new source",
    resetIds.join(",") === "new-1,new-2",
    resetIds.join(",")
  )
  check("reset starts a fresh cycle", resetDeck.remaining() === 0)

  console.log(
    failures === 0
      ? `\nALL ${passes} CHECKS PASSED\n`
      : `\n${failures} CHECK(S) FAILED (${passes} passed)\n`
  )
  process.exit(failures === 0 ? 0 : 1)
}

try {
  main()
} catch (error) {
  console.error("test-casino-game failed:", error)
  process.exit(1)
}
