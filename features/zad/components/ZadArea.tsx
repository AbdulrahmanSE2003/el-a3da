"use client"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Qa3daCard from "@/components/ui/Qa3daCard"
import { useState } from "react"
import { createContentDeck } from "@/lib/create-content-deck"
import { topics } from "@/contents/topics"
import { zadTopics } from "@/contents/zad"

const ZadArea = () => {
  const [deck] = useState(() => createContentDeck(zadTopics))

  const [currentTopic, setCurrentTopic] = useState(() => deck.next())

  const handleNext = () => {
    setCurrentTopic(deck.next())
  }
  return (
    <section className="relative z-10 my-auto flex w-full max-w-md flex-col items-center pt-2">
      {/* Section Context */}
      <div className="mb-6 text-center">
        <h2 className="mb-1 text-2xl font-bold text-ink-glow">
          {" "}
          زاد القعدة 🌿
        </h2>
        <p className="text-sm font-medium text-ink-soft/80">
          {" "}
          &quot;زاد صغير... ممكن تنتفع بيه&quot;
        </p>
      </div>

      <Qa3daCard
        text={currentTopic.text}
        id={currentTopic.id}
        category={currentTopic.category}
        badgeLabel="زاد"
      />

      {/* Action Button */}
      <Button onClick={handleNext} className="group mt-8 w-full" size="lg">
        <span className="text-lg">زاد تاني</span>
        <RefreshCw className="h-5 w-5 transition-transform duration-1000 ease-out group-active:rotate-360" />
      </Button>
    </section>
  )
}

export default ZadArea
