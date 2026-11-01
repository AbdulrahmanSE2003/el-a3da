"use client"

import { useEffect, useRef, useState } from "react"

import { useContentSet } from "@/lib/content/use-content-set"
import { createContentDeck, type ContentDeck } from "@/lib/create-content-deck"
import type { ContentQuestion } from "@/lib/content/types"
import { usePartyStore } from "@/store/party-store"
import { createSoundPlayer } from "@/games/lib/audio/sound-player"
import {
  changePlayerScore,
  createGame,
  nextQuestion,
  restartGame,
} from "@/games/casino"
import type { CasinoGame, CasinoGamePlayer } from "@/games/casino/types"

import CasinoPlay from "./CasinoPlay"
import CasinoResult from "./CasinoResult"
import CasinoSetup from "./CasinoSetup"

const VICTORY_SOUND_SRC = "/sounds/victory.ogg"
const victoryPlayer = createSoundPlayer()

const Casino = () => {
  const players = usePartyStore((state) => state.players)

  // محتوى الجلسة: بيتحلّ مرة واحدة قبل بداية اللعب. أي مزامنة بعد كده
  // بتكتب في الكاش بس وبتظهر في الجلسة اللي بعدها.
  const { snapshot, ready } = useContentSet("casino")

  const [game, setGame] = useState<CasinoGame | null>(null)
  const deckRef = useRef<ContentDeck<ContentQuestion> | null>(null)
  const previousPhaseRef = useRef<CasinoGame["phase"] | null>(null)

  const handleStart = (winningScore: number) => {
    const deck = createContentDeck([...snapshot.questions])

    deckRef.current = deck
    setGame(createGame(players, winningScore, deck))
  }

  const handleChangeScore = (
    player: CasinoGamePlayer,
    action: "increase" | "decrease"
  ) => {
    if (!game) return

    const updatedGame = changePlayerScore(player, action, game)

    if (!updatedGame) return

    setGame(updatedGame)
  }

  const handleNextQuestion = () => {
    if (!game || !deckRef.current) return

    setGame(nextQuestion(game, deckRef.current))
  }

  const handleRestart = () => {
    if (!game || !deckRef.current) return

    setGame(restartGame(game, deckRef.current))
  }

  // تشغيل صوت الإتمام عندما تنتهي اللعبة بالكامل (انتقال الطور إلى "finished"),
  // وليس بعد كل سؤال أو جولة وسطية. يتم التشغيل مرة واحدة فقط عند الانتقال،
  // ويُمنع التكرار عند إعادة العرض أو تحديث الحالة.
  useEffect(() => {
    if (!game) return

    const previousPhase = previousPhaseRef.current
    previousPhaseRef.current = game.phase

    if (previousPhase === null) return
    if (previousPhase === game.phase) return

    if (game.phase === "finished") {
      victoryPlayer.play(VICTORY_SOUND_SRC, 0.7)
    }
  }, [game])

  if (!game) {
    return <CasinoSetup ready={ready} onStart={handleStart} />
  }

  switch (game.phase) {
    case "game":
      return (
        <CasinoPlay
          game={game}
          onChangeScore={handleChangeScore}
          onNextQuestion={handleNextQuestion}
        />
      )

    case "finished":
      return <CasinoResult game={game} onRestart={handleRestart} />

    default:
      return null
  }
}

export default Casino
