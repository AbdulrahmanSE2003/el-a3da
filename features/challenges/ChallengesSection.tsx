"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import Qa3daCard from "@/components/ui/Qa3daCard"
import { createContentDeck } from "@/lib/create-content-deck"
import { challenges } from "@/contents/challenges"

const ChallengesSection = () => {
  const [deck] = useState(() => createContentDeck(challenges))

  const [currentChallenge, setCurrentChallenge] = useState(() => deck.next())

  const handleNext = () => {
    setCurrentChallenge(deck.next())
  }

  return (
    <section className="relative z-10 my-auto flex w-full pt-2 max-w-md flex-col items-center">
      <div className="mb-6 text-center">
        <h2 className="mb-1 text-2xl font-bold text-ink-glow">أسئلة وتحديات</h2>
        <p className="text-sm font-medium text-ink-soft/80">
          &quot;جاهز تعمل حاجة محدش متوقعها؟&quot;
        </p>
      </div>

      {/* Dynamic Card Component */}
      <Qa3daCard
        id={currentChallenge.id}
        text={currentChallenge.text}
        category={currentChallenge.category}
        badgeLabel="CHALLENGE"
      />

      {/* Action Button */}
      <Button onClick={handleNext} className="group mt-8 w-full" size="lg">
        <span>تحدي تاني</span>
        <RefreshCw className="transition-transform duration-500 ease-out group-active:rotate-180" />
      </Button>
    </section>
  )
}

export default ChallengesSection
