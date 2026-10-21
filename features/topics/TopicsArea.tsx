"use client"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Qa3daCard from "@/components/ui/Qa3daCard"
import { useState } from "react"
import { createContentDeck } from "@/lib/create-content-deck"
import { topics } from "@/contents/topics"

const TopicsArea = () => {
  const [deck] = useState(() => createContentDeck(topics))

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
          مواضيع وحوارات
        </h2>
        <p className="text-sm font-medium text-ink-soft/80">
          {" "}
          &quot;افتح موضوع... وخلي القعدة تبدأ&quot;
        </p>
      </div>

      <Qa3daCard
        text={currentTopic.text}
        id={currentTopic.id}
        category={currentTopic.category}
      />

      {/* Action Button */}
      <Button onClick={handleNext} className="group mt-8 w-full" size="lg">
        <span className="text-lg">موضوع تاني</span>
        <RefreshCw className="h-5 w-5 transition-transform duration-1000 ease-out group-active:rotate-360" />
      </Button>
    </section>
  )
}

export default TopicsArea
