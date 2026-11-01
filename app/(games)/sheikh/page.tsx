"use client"

import GridPattern from "@/components/atmosphere/GridPattern"
import BackgroundAtmosphere from "@/components/atmosphere/BackgroundAtmosphere"
import Header from "@/components/layout/Header"

import { useSheikh } from "@/hooks/use-sheikh"
import { IdlePhase } from "@/features/sheikh/IdlePhase"
import { RevealedPhase } from "@/features/sheikh/RevealedPhase"
import { QuestionsPhase } from "@/features/sheikh/QuestionsPhase"
import Spinner from "@/components/ui/Spinner"

export default function SheikhPage() {
  const {
    players,
    sheikh,
    phase,
    currentQuestion,
    chooseSheikh,
    startQuestions,
    nextQuestion,
    reset,
  } = useSheikh()

  if (players.length === 0) return null

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-paper px-5 py-6 text-ink">
      <GridPattern />
      <BackgroundAtmosphere />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col">
        <Header stamp="SHEIKH" />

        {/* {phase === "idle" && <IdlePhase onChooseSheikh={chooseSheikh} />} */}
        {phase === "idle" && (
          <div className={`flex h-[85svh] items-center justify-center py-3`}>
            <Spinner players={players} onChooseSheikh={chooseSheikh} items={players.map((p) => p.name)} />
          </div>
        )}

        {phase === "revealed" && sheikh && (
          <RevealedPhase sheikh={sheikh} onStartQuestions={startQuestions} />
        )}

        {phase === "questions" && sheikh && (
          <QuestionsPhase
            sheikh={sheikh}
            currentQuestion={currentQuestion}
            onNextQuestion={nextQuestion}
            onReset={reset}
          />
        )}
      </div>
    </main>
  )
}
