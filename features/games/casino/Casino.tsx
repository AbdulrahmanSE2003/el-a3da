"use client"

import { useRef, useState } from "react"

import { useContentSet } from "@/lib/content/use-content-set"
import { createContentDeck, type ContentDeck } from "@/lib/create-content-deck"
import type { ContentQuestion } from "@/lib/content/types"
import { usePartyStore } from "@/store/party-store"
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

const Casino = () => {
  const players = usePartyStore((state) => state.players)

  // محتوى الجلسة: بيتحلّ مرة واحدة قبل بداية اللعب. أي مزامنة بعد كده
  // بتكتب في الكاش بس وبتظهر في الجلسة اللي بعدها.
  const { snapshot, ready } = useContentSet("casino")

  const [game, setGame] = useState<CasinoGame | null>(null)
  const deckRef = useRef<ContentDeck<ContentQuestion> | null>(null)

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
