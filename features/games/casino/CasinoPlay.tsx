"use client"

import { Button } from "@/components/ui/button"
import type { CasinoGame, CasinoGamePlayer } from "@/games/casino/types"
import { ArrowRight } from "lucide-react"
import PlayersPoints from "./PlayersPoints"
import QuestionHeader from "./QuestionHeader"

const CasinoPlay = ({
  game,
  onChangeScore,
  onNextQuestion,
}: {
  game: CasinoGame
  onChangeScore: (
    player: CasinoGamePlayer,
    action: "increase" | "decrease"
  ) => void
  onNextQuestion: () => void
}) => {
  const { currentQuestion, players } = game

  return (
    <section className="flex h-full w-full flex-col justify-between gap-6">
      {/* Question */}
      <QuestionHeader currentQuestion={currentQuestion} />

      {/* Switch Question */}
      <Button onClick={onNextQuestion} variant={"secondary"}>
        <ArrowRight />
        سؤال تاني
      </Button>

      {/* Points */}
      <PlayersPoints players={players} onChange={onChangeScore} />
    </section>
  )
}

export default CasinoPlay
